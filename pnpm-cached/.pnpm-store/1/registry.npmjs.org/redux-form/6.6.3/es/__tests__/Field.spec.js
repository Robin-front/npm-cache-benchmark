var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint react/no-multi-comp:0 */
import React, { Component } from 'react';
import { createSpy } from 'expect';
import { Provider } from 'react-redux';
import { combineReducers as plainCombineReducers, createStore } from 'redux';
import { combineReducers as immutableCombineReducers } from 'redux-immutablejs';
import TestUtils from 'react-dom/test-utils';
import createReduxForm from '../reduxForm';
import createReducer from '../reducer';
import createField from '../Field';
import FormSection from '../FormSection';
import plain from '../structure/plain';
import plainExpectations from '../structure/plain/expectations';
import immutable from '../structure/immutable';
import immutableExpectations from '../structure/immutable/expectations';
import addExpectations from './addExpectations';
import { dragStartMock, dropMock } from '../util/eventMocks';
import { dataKey } from '../util/eventConsts';

var testFormName = 'testForm';

var describeField = function describeField(name, structure, combineReducers, expect) {
  var reduxForm = createReduxForm(structure);
  var Field = createField(structure);
  var reducer = createReducer(structure);
  var fromJS = structure.fromJS,
      getIn = structure.getIn;

  var makeStore = function makeStore(initial) {
    return createStore(combineReducers({ form: reducer }), fromJS({ form: initial }));
  };

  var TestInput = function (_Component) {
    _inherits(TestInput, _Component);

    function TestInput() {
      _classCallCheck(this, TestInput);

      return _possibleConstructorReturn(this, (TestInput.__proto__ || Object.getPrototypeOf(TestInput)).apply(this, arguments));
    }

    _createClass(TestInput, [{
      key: 'render',
      value: function render() {
        return React.createElement(
          'div',
          null,
          'TEST INPUT'
        );
      }
    }]);

    return TestInput;
  }(Component);

  var testProps = function testProps(state) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var store = makeStore(_defineProperty({}, testFormName, state));

    var Form = function (_Component2) {
      _inherits(Form, _Component2);

      function Form() {
        _classCallCheck(this, Form);

        return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
      }

      _createClass(Form, [{
        key: 'render',
        value: function render() {
          return React.createElement(
            'div',
            null,
            React.createElement(Field, { name: 'foo', component: TestInput })
          );
        }
      }]);

      return Form;
    }(Component);

    var TestForm = reduxForm(_extends({ form: testFormName }, config))(Form);
    var dom = TestUtils.renderIntoDocument(React.createElement(
      Provider,
      { store: store },
      React.createElement(TestForm, null)
    ));
    return TestUtils.findRenderedComponentWithType(dom, TestInput).props;
  };

  describe(name, function () {
    it('should throw an error if not in ReduxForm', function () {
      expect(function () {
        TestUtils.renderIntoDocument(React.createElement(
          'div',
          null,
          React.createElement(Field, { name: 'foo', component: TestInput })
        ));
      }).toThrow(/must be inside a component decorated with reduxForm/);
    });

    it('should get value from Redux state', function () {
      var props = testProps({
        values: {
          foo: 'bar'
        }
      });
      expect(props.input.value).toBe('bar');
    });

    it('should get dirty/pristine from Redux state', function () {
      var props1 = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        }
      });
      expect(props1.meta.pristine).toBe(true);
      expect(props1.meta.dirty).toBe(false);
      var props2 = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'baz'
        }
      });
      expect(props2.meta.pristine).toBe(false);
      expect(props2.meta.dirty).toBe(true);
      var props3 = testProps({
        initial: {
          foo: [4, 'abc', { def: null, 'key': [-45, '...', [0, 99]] }]
        },
        values: {
          foo: [4, 'abc', { def: null, 'key': [-45, '...', [0, 99]] }]
        }
      });
      expect(props3.meta.pristine).toBe(true);
      expect(props3.meta.dirty).toBe(false);
    });

    it('should allow an empty value from Redux state to be pristine', function () {
      var props1 = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: ''
        }
      });
      expect(props1.meta.pristine).toBe(false);
      expect(props1.meta.dirty).toBe(true);
      var props2 = testProps({
        initial: {
          foo: ''
        },
        values: {
          foo: ''
        }
      });
      expect(props2.meta.pristine).toBe(true);
      expect(props2.meta.dirty).toBe(false);
    });

    it('should get asyncValidating from Redux state', function () {
      var props1 = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        },
        asyncValidating: 'dog'
      });
      expect(props1.meta.asyncValidating).toBe(false);
      var props2 = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'baz'
        },
        asyncValidating: 'foo'
      });
      expect(props2.meta.asyncValidating).toBe(true);
    });

    it('should get active from Redux state', function () {
      var props1 = testProps({
        values: {
          foo: 'bar'
        }
      });
      expect(props1.meta.active).toBe(false);
      var props2 = testProps({
        values: {
          foo: 'bar'
        },
        fields: {
          foo: {
            active: true
          }
        }
      });
      expect(props2.meta.active).toBe(true);
    });

    it('should get autofilled from Redux state', function () {
      var props1 = testProps({
        values: {
          foo: 'bar'
        }
      });
      expect(props1.meta.autofilled).toBe(false);
      var props2 = testProps({
        values: {
          foo: 'bar'
        },
        fields: {
          foo: {
            autofilled: true
          }
        }
      });
      expect(props2.meta.autofilled).toBe(true);
    });

    it('should get touched from Redux state', function () {
      var props1 = testProps({
        values: {
          foo: 'bar'
        }
      });
      expect(props1.meta.touched).toBe(false);
      var props2 = testProps({
        values: {
          foo: 'bar'
        },
        fields: {
          foo: {
            touched: true
          }
        }
      });
      expect(props2.meta.touched).toBe(true);
    });

    it('should get visited from Redux state', function () {
      var props1 = testProps({
        values: {
          foo: 'bar'
        }
      });
      expect(props1.meta.visited).toBe(false);
      var props2 = testProps({
        values: {
          foo: 'bar'
        },
        fields: {
          foo: {
            visited: true
          }
        }
      });
      expect(props2.meta.visited).toBe(true);
    });

    it('should pass in the form name as meta.form', function () {
      var props = testProps();
      expect(props.meta.form).toBe(testFormName);
    });

    it('should get sync errors from outer reduxForm component', function () {
      var props = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        },
        registeredFields: {
          foo: { name: 'foo', type: 'Field' }
        }
      }, {
        validate: function validate() {
          return { foo: 'foo error' };
        }
      });
      expect(props.meta.error).toBe('foo error');
    });

    it('should get sync warnings from outer reduxForm component', function () {
      var props = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        },
        registeredFields: {
          foo: { name: 'foo', type: 'Field' }
        }
      }, {
        warn: function warn() {
          return { foo: 'foo warning' };
        }
      });
      expect(props.meta.warning).toBe('foo warning');
    });

    it('should get async errors from Redux state', function () {
      var props = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        },
        asyncErrors: {
          foo: 'foo error'
        }
      });
      expect(props.meta.error).toBe('foo error');
    });

    it('should get submit errors from Redux state', function () {
      var props = testProps({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        },
        submitErrors: {
          foo: 'foo error'
        }
      });
      expect(props.meta.error).toBe('foo error');
    });

    it('should get submitFailed prop from Redux state', function () {
      var props = testProps({
        submitFailed: true
      });
      expect(props.meta.submitFailed).toBe(true);
    });

    it('should provide meta.dispatch', function () {
      var props = testProps({});
      expect(props.meta.dispatch).toExist().toBeA('function');
    });

    it('should provide name getter', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component3) {
        _inherits(Form, _Component3);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.name).toBe('foo');
    });

    it('should provide value getter', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component4) {
        _inherits(Form, _Component4);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.value).toBe('bar');
    });

    it('should provide dirty getter that is true when dirty', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component5) {
        _inherits(Form, _Component5);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.dirty).toBe(true);
    });

    it('should provide dirty getter that is false when pristine', function () {
      var store = makeStore({
        testForm: {
          initial: {
            foo: 'bar'
          },
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component6) {
        _inherits(Form, _Component6);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.dirty).toBe(false);
    });

    it('should provide pristine getter that is false when dirty', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component7) {
        _inherits(Form, _Component7);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.pristine).toBe(false);
    });

    it('should provide pristine getter that is true when pristine', function () {
      var store = makeStore({
        testForm: {
          initial: {
            foo: 'bar'
          },
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component8) {
        _inherits(Form, _Component8);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.pristine).toBe(true);
    });

    it('should have value set to initial value on first render', function () {
      var store = makeStore({});
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component9) {
        _inherits(Form, _Component9);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: input })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm'
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, { initialValues: { foo: 'bar' } })
      ));
      expect(input).toHaveBeenCalled();
      expect(input.calls[0].arguments[0].input.value).toBe('bar');
    });

    it('should provide sync error for array field', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: ['bar']
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var validate = function validate() {
        return { foo: ['bar error'] };
      };

      var Form = function (_Component10) {
        _inherits(Form, _Component10);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo[0]', component: input })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        validate: validate
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(input).toHaveBeenCalled();
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].meta.valid).toBe(false);
      expect(input.calls[0].arguments[0].meta.error).toBe('bar error');
    });

    it('should provide sync warning for array field', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: ['bar']
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var warn = function warn() {
        return { foo: ['bar warning'] };
      };

      var Form = function (_Component11) {
        _inherits(Form, _Component11);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo[0]', component: input })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        warn: warn
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(input).toHaveBeenCalled();
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].meta.warning).toBe('bar warning');
    });

    it('should provide access to rendered component', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'bar'
          }
        }
      });

      var Form = function (_Component12) {
        _inherits(Form, _Component12);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: TestInput, withRef: true })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var field = TestUtils.findRenderedComponentWithType(dom, Field);
      var input = TestUtils.findRenderedComponentWithType(dom, TestInput);

      expect(field.getRenderedComponent()).toBe(input);
    });

    it('should reconnect when name changes', function () {
      var store = makeStore({
        testForm: {
          values: {
            foo: 'fooValue',
            bar: 'barValue'
          },
          fields: {
            bar: {
              touched: true
            }
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component13) {
        _inherits(Form, _Component13);

        function Form() {
          _classCallCheck(this, Form);

          var _this13 = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this));

          _this13.state = { field: 'foo' };
          return _this13;
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            var _this14 = this;

            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: this.state.field, component: input }),
              React.createElement(
                'button',
                { onClick: function onClick() {
                    return _this14.setState({ field: 'bar' });
                  } },
                'Change'
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(input).toHaveBeenCalled();
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].input.value).toBe('fooValue');
      expect(input.calls[0].arguments[0].meta.touched).toBe(false);

      var button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button');
      TestUtils.Simulate.click(button);

      expect(input.calls.length).toBe(2);
      expect(input.calls[1].arguments[0].input.value).toBe('barValue');
      expect(input.calls[1].arguments[0].meta.touched).toBe(true);
    });

    it('should prefix name getter when inside FormSection', function () {
      var store = makeStore();

      var Form = function (_Component14) {
        _inherits(Form, _Component14);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              FormSection,
              { name: 'foo', component: 'span' },
              React.createElement(Field, { name: 'bar', component: 'input' })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.name).toBe('foo.bar');
    });
    it('should prefix name getter when inside multiple FormSection', function () {
      var store = makeStore();

      var Form = function (_Component15) {
        _inherits(Form, _Component15);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              FormSection,
              { name: 'foo' },
              React.createElement(
                FormSection,
                { name: 'fighter' },
                React.createElement(Field, { name: 'bar', component: 'input' })
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      var stub = TestUtils.findRenderedComponentWithType(dom, Field);
      expect(stub.name).toBe('foo.fighter.bar');
    });

    it('should prefix name when inside FormSection', function () {
      var store = makeStore();

      var Form = function (_Component16) {
        _inherits(Form, _Component16);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              FormSection,
              { name: 'foo', component: 'span' },
              React.createElement(Field, { name: 'bar', component: 'input' })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            registeredFields: { 'foo.bar': { name: 'foo.bar', type: 'Field', count: 1 } }
          }
        }
      });
    });

    it('should prefix name when inside multiple FormSections', function () {
      var store = makeStore();

      var Form = function (_Component17) {
        _inherits(Form, _Component17);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              FormSection,
              { name: 'foo' },
              React.createElement(
                FormSection,
                { name: 'fighter' },
                React.createElement(Field, { name: 'bar', component: 'input' })
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            registeredFields: { 'foo.fighter.bar': { name: 'foo.fighter.bar', type: 'Field', count: 1 } }
          }
        }
      });
    });

    it('should re-register when name changes', function () {
      var store = makeStore();

      var Form = function (_Component18) {
        _inherits(Form, _Component18);

        function Form() {
          _classCallCheck(this, Form);

          var _this19 = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this));

          _this19.state = { field: 'foo' };
          return _this19;
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            var _this20 = this;

            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: this.state.field, component: 'input' }),
              React.createElement(
                'button',
                { onClick: function onClick() {
                    return _this20.setState({ field: 'bar' });
                  } },
                'Change'
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            registeredFields: { foo: { name: 'foo', type: 'Field', count: 1 } }
          }
        }
      });

      var button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button');
      TestUtils.Simulate.click(button);

      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            registeredFields: { bar: { name: 'bar', type: 'Field', count: 1 } }
          }
        }
      });
    });

    it('should rerender when props change', function () {
      var store = makeStore();
      var input = createSpy(function (props) {
        return React.createElement(
          'div',
          null,
          props.highlighted,
          React.createElement('input', props.input)
        );
      }).andCallThrough();

      var Form = function (_Component19) {
        _inherits(Form, _Component19);

        function Form() {
          _classCallCheck(this, Form);

          var _this21 = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this));

          _this21.state = { highlighted: 0 };
          return _this21;
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            var _this22 = this;

            var highlighted = this.state.highlighted;

            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', highlighted: highlighted, component: input }),
              React.createElement(
                'button',
                { onClick: function onClick() {
                    return _this22.setState({ highlighted: highlighted + 1 });
                  } },
                'Change'
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(input).toHaveBeenCalled();
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].highlighted).toBe(0);

      var button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button');
      TestUtils.Simulate.click(button);

      expect(input.calls.length).toBe(2);
      expect(input.calls[1].arguments[0].highlighted).toBe(1);
    });

    it('should NOT rerender when props.props is shallow-equal, but !==', function () {
      var store = makeStore();
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var renderSpy = createSpy();

      var Form = function (_Component20) {
        _inherits(Form, _Component20);

        function Form() {
          _classCallCheck(this, Form);

          var _this23 = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this));

          _this23.state = { foo: 'bar' };
          return _this23;
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            var _this24 = this;

            renderSpy();
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'myField', component: input, props: { rel: 'test' } }),
              React.createElement(
                'button',
                { onClick: function onClick() {
                    return _this24.setState({ foo: 'qux' });
                  } },
                'Change'
              )
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(renderSpy).toHaveBeenCalled();
      expect(renderSpy.calls.length).toBe(1);

      expect(input).toHaveBeenCalled();
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].rel).toBe('test');

      var button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button');
      TestUtils.Simulate.click(button);

      expect(renderSpy.calls.length).toBe(2);

      expect(input.calls.length).toBe(1);
    });

    it('should call normalize function on change', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form',
            author: 'Erik Rasmussen',
            username: 'oldusername'
          }
        }
      });
      var renderUsername = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var normalize = createSpy(function (value) {
        return value.toLowerCase();
      }).andCallThrough();

      var Form = function (_Component21) {
        _inherits(Form, _Component21);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'title', component: 'input' }),
              React.createElement(Field, { name: 'author', component: 'input' }),
              React.createElement(Field, { name: 'username', component: renderUsername, normalize: normalize })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(normalize).toNotHaveBeenCalled();

      expect(renderUsername.calls[0].arguments[0].input.value).toBe('oldusername');
      renderUsername.calls[0].arguments[0].input.onChange('ERIKRAS');

      expect(normalize).toHaveBeenCalled().toHaveBeenCalledWith('ERIKRAS', 'oldusername', fromJS({
        title: 'Redux Form',
        author: 'Erik Rasmussen',
        username: 'ERIKRAS'
      }), fromJS({
        title: 'Redux Form',
        author: 'Erik Rasmussen',
        username: 'oldusername'
      }));
      expect(normalize.calls.length).toBe(1);

      expect(renderUsername.calls[1].arguments[0].input.value).toBe('erikras');
    });

    it('should call normalize function on blur', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form',
            author: 'Erik Rasmussen',
            username: 'oldusername'
          }
        }
      });
      var renderUsername = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var normalize = createSpy(function (value) {
        return value.toLowerCase();
      }).andCallThrough();

      var Form = function (_Component22) {
        _inherits(Form, _Component22);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'title', component: 'input' }),
              React.createElement(Field, { name: 'author', component: 'input' }),
              React.createElement(Field, { name: 'username', component: renderUsername, normalize: normalize })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(normalize).toNotHaveBeenCalled();

      expect(renderUsername.calls[0].arguments[0].input.value).toBe('oldusername');
      renderUsername.calls[0].arguments[0].input.onBlur('ERIKRAS');

      expect(normalize).toHaveBeenCalled().toHaveBeenCalledWith('ERIKRAS', 'oldusername', fromJS({
        title: 'Redux Form',
        author: 'Erik Rasmussen',
        username: 'ERIKRAS'
      }), fromJS({
        title: 'Redux Form',
        author: 'Erik Rasmussen',
        username: 'oldusername'
      }));
      expect(normalize.calls.length).toBe(1);

      expect(renderUsername.calls[1].arguments[0].input.value).toBe('erikras');
    });

    it('should call asyncValidate function on blur', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form',
            author: 'Erik Rasmussen',
            username: 'oldusername'
          }
        }
      });
      var renderUsername = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component23) {
        _inherits(Form, _Component23);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'title', component: 'input' }),
              React.createElement(Field, { name: 'author', component: 'input' }),
              React.createElement(Field, { name: 'username', component: renderUsername })
            );
          }
        }]);

        return Form;
      }(Component);

      var asyncValidate = createSpy(function () {
        return new Promise(function (resolve) {
          return resolve();
        });
      }).andCallThrough();
      var TestForm = reduxForm({ form: 'testForm', asyncValidate: asyncValidate })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      renderUsername.calls[0].arguments[0].input.onBlur('ERIKRAS');

      expect(asyncValidate).toHaveBeenCalled();
    });

    it('should call handle on focus', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form'
          }
        }
      });
      var renderTitle = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component24) {
        _inherits(Form, _Component24);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(Field, { name: 'title', component: renderTitle });
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(renderTitle.calls[0].arguments[0].meta.visited).toBe(false);
      renderTitle.calls[0].arguments[0].input.onFocus();
      expect(renderTitle.calls[1].arguments[0].meta.visited).toBe(true);
    });

    it('should not change the value of a radio when blur', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form',
            author: 'Erik Rasmussen',
            sex: 'male'
          }
        }
      });
      var renderSex = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component25) {
        _inherits(Form, _Component25);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'title', component: 'input' }),
              React.createElement(Field, { name: 'author', component: 'input' }),
              React.createElement(Field, { name: 'sex', value: 'female', type: 'radio', component: renderSex }),
              React.createElement(Field, { name: 'sex', value: 'male', type: 'radio', component: renderSex })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(renderSex.calls[0].arguments[0].input.checked).toBe(false);
      expect(renderSex.calls[1].arguments[0].input.checked).toBe(true);
      renderSex.calls[0].arguments[0].input.onBlur('female');

      expect(renderSex.calls[2].arguments[0].input.checked).toBe(false);
      expect(renderSex.calls[3].arguments[0].input.checked).toBe(true);
    });

    it('should call handle on drag start with value', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form'
          }
        }
      });
      var renderTitle = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var dragSpy = createSpy(function (key, val) {
        return val;
      }).andCallThrough();
      var event = dragStartMock(dragSpy);

      var Form = function (_Component26) {
        _inherits(Form, _Component26);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(Field, { name: 'title', component: renderTitle });
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(dragSpy).toNotHaveBeenCalled();
      renderTitle.calls[0].arguments[0].input.onDragStart(event);
      expect(dragSpy).toHaveBeenCalled().toHaveBeenCalledWith(dataKey, 'Redux Form');
    });

    it('should call handle on drag start without value', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: null
          }
        }
      });
      var renderTitle = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var dragSpy = createSpy(function (key, val) {
        return val;
      }).andCallThrough();
      var event = dragStartMock(dragSpy);

      var Form = function (_Component27) {
        _inherits(Form, _Component27);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(Field, { name: 'title', component: renderTitle });
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(dragSpy).toNotHaveBeenCalled();
      renderTitle.calls[0].arguments[0].input.onDragStart(event);
      expect(dragSpy).toHaveBeenCalled().toHaveBeenCalledWith(dataKey, '');
    });

    it('should call handle on drop', function () {
      var store = makeStore({
        testForm: {
          values: {
            title: 'Redux Form'
          }
        }
      });
      var renderTitle = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var dropSpy = createSpy(function (key) {
        return key;
      }).andCallThrough();
      var event = dropMock(dropSpy);
      event.preventDefault = createSpy(event.preventDefault);

      var Form = function (_Component28) {
        _inherits(Form, _Component28);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(Field, { name: 'title', component: renderTitle });
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(dropSpy).toNotHaveBeenCalled();
      renderTitle.calls[0].arguments[0].input.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(dropSpy).toHaveBeenCalled().toHaveBeenCalledWith(dataKey);
    });

    it('should call format function on first render', function () {
      var store = makeStore({
        testForm: {
          values: {
            name: 'Redux Form'
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var format = createSpy(function (value) {
        return value.toLowerCase();
      }).andCallThrough();

      var Form = function (_Component29) {
        _inherits(Form, _Component29);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'name', component: input, format: format })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(format).toHaveBeenCalled();
      expect(format.calls.length).toBe(1);
      expect(format.calls[0].arguments).toEqual(['Redux Form', 'name']);

      expect(input.calls[0].arguments[0].input.value).toBe('redux form');
    });

    it('should call parse function on change', function () {
      var store = makeStore({
        testForm: {
          values: {
            name: 'redux form'
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var parse = createSpy(function (value) {
        return value.toLowerCase();
      }).andCallThrough();

      var Form = function (_Component30) {
        _inherits(Form, _Component30);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'name', component: input, parse: parse })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(parse).toNotHaveBeenCalled();

      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].input.value).toBe('redux form');

      input.calls[0].arguments[0].input.onChange('REDUX FORM ROCKS');

      expect(parse).toHaveBeenCalled();
      expect(parse.calls.length).toBe(1);
      expect(parse.calls[0].arguments).toEqual(['REDUX FORM ROCKS', 'name']);

      expect(input.calls.length).toBe(2);
      expect(input.calls[1].arguments[0].input.value).toBe('redux form rocks');
    });

    it('should call parse function on blur', function () {
      var store = makeStore({
        testForm: {
          values: {
            name: 'redux form'
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var parse = createSpy(function (value) {
        return value.toLowerCase();
      }).andCallThrough();

      var Form = function (_Component31) {
        _inherits(Form, _Component31);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'name', component: input, parse: parse })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(parse).toNotHaveBeenCalled();

      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].input.value).toBe('redux form');

      input.calls[0].arguments[0].input.onBlur('REDUX FORM ROCKS');

      expect(parse).toHaveBeenCalled();
      expect(parse.calls.length).toBe(1);
      expect(parse.calls[0].arguments).toEqual(['REDUX FORM ROCKS', 'name']);

      expect(input.calls.length).toBe(2);
      expect(input.calls[1].arguments[0].input.value).toBe('redux form rocks');
    });

    it('should parse and format to maintain different type in store', function () {
      var store = makeStore({
        testForm: {
          values: {
            age: 42
          }
        }
      });
      var input = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var parse = createSpy(function (value) {
        return value && parseInt(value, 10);
      }).andCallThrough();
      var format = createSpy(function (value) {
        return value && value.toString();
      }).andCallThrough();

      var Form = function (_Component32) {
        _inherits(Form, _Component32);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'age', component: input, format: format, parse: parse })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // format called once
      expect(format).toHaveBeenCalled();
      expect(format.calls.length).toBe(1);

      // parse not called yet
      expect(parse).toNotHaveBeenCalled();

      // input displaying string value
      expect(input.calls.length).toBe(1);
      expect(input.calls[0].arguments[0].input.value).toBe('42');

      // update value
      input.calls[0].arguments[0].input.onChange('15');

      // parse was called
      expect(parse).toHaveBeenCalled();
      expect(parse.calls.length).toBe(1);
      expect(parse.calls[0].arguments).toEqual(['15', 'age']);

      // value in store is number
      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            values: {
              age: 15 // number
            },
            registeredFields: { age: { name: 'age', type: 'Field', count: 1 } }
          }
        }
      });

      // format called again
      expect(format).toHaveBeenCalled();
      expect(format.calls.length).toBe(2);
      expect(format.calls[1].arguments).toEqual([15, 'age']);

      // input rerendered with string value
      expect(input.calls.length).toBe(2);
      expect(input.calls[1].arguments[0].input.value).toBe('15');
    });

    it('should rerender when sync error changes', function () {
      var store = makeStore({
        testForm: {
          values: {
            password: 'redux-form sucks',
            confirm: 'redux-form rocks'
          }
        }
      });
      var passwordInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var confirmInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var validate = function validate(values) {
        var password = getIn(values, 'password');
        var confirm = getIn(values, 'confirm');
        return password === confirm ? {} : { confirm: 'Must match!' };
      };

      var Form = function (_Component33) {
        _inherits(Form, _Component33);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'password', component: passwordInput }),
              React.createElement(Field, { name: 'confirm', component: confirmInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        validate: validate
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // password input rendered
      expect(passwordInput).toHaveBeenCalled();
      expect(passwordInput.calls.length).toBe(1);

      // confirm input rendered with error
      expect(confirmInput).toHaveBeenCalled();
      expect(confirmInput.calls.length).toBe(1);
      expect(confirmInput.calls[0].arguments[0].meta.valid).toBe(false);
      expect(confirmInput.calls[0].arguments[0].meta.error).toBe('Must match!');

      // update password field so that they match
      passwordInput.calls[0].arguments[0].input.onChange('redux-form rocks');

      // password input rerendered
      expect(passwordInput.calls.length).toBe(2);

      // confirm input should also rerender, but with no error
      expect(confirmInput.calls.length).toBe(2);
      expect(confirmInput.calls[1].arguments[0].meta.valid).toBe(true);
      expect(confirmInput.calls[1].arguments[0].meta.error).toBe(undefined);
    });

    it('should rerender when sync error is cleared', function () {
      var store = makeStore();
      var usernameInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var validate = function validate(values) {
        var username = getIn(values, 'username');
        return username ? {} : { username: 'Required' };
      };

      var Form = function (_Component34) {
        _inherits(Form, _Component34);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'username', component: usernameInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        validate: validate
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // username input rendered
      expect(usernameInput).toHaveBeenCalled();
      expect(usernameInput.calls.length).toBe(1);

      // username field has error
      expect(usernameInput.calls[0].arguments[0].meta.valid).toBe(false);
      expect(usernameInput.calls[0].arguments[0].meta.error).toBe('Required');

      // update username field so it passes
      usernameInput.calls[0].arguments[0].input.onChange('erikras');

      // username input rerendered
      expect(usernameInput.calls.length).toBe(2);

      // should be valid now
      expect(usernameInput.calls[1].arguments[0].meta.valid).toBe(true);
      expect(usernameInput.calls[1].arguments[0].meta.error).toBe(undefined);
    });

    it('should rerender when sync warning changes', function () {
      var store = makeStore({
        testForm: {
          values: {
            password: 'redux-form sucks',
            confirm: 'redux-form rocks'
          }
        }
      });
      var passwordInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var confirmInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var warn = function warn(values) {
        var password = getIn(values, 'password');
        var confirm = getIn(values, 'confirm');
        return password === confirm ? {} : { confirm: 'Should match. Or not. Whatever.' };
      };

      var Form = function (_Component35) {
        _inherits(Form, _Component35);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'password', component: passwordInput }),
              React.createElement(Field, { name: 'confirm', component: confirmInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        warn: warn
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // password input rendered
      expect(passwordInput).toHaveBeenCalled();
      expect(passwordInput.calls.length).toBe(1);

      // confirm input rendered with warning
      expect(confirmInput).toHaveBeenCalled();
      expect(confirmInput.calls.length).toBe(1);
      expect(confirmInput.calls[0].arguments[0].meta.warning).toBe('Should match. Or not. Whatever.');

      // update password field so that they match
      passwordInput.calls[0].arguments[0].input.onChange('redux-form rocks');

      // password input rerendered
      expect(passwordInput.calls.length).toBe(2);

      // confirm input should also rerender, but with no warning
      expect(confirmInput.calls.length).toBe(2);
      expect(confirmInput.calls[1].arguments[0].meta.warning).toBe(undefined);
    });

    it('should rerender when sync warning is cleared', function () {
      var store = makeStore();
      var usernameInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var warn = function warn(values) {
        var username = getIn(values, 'username');
        return username ? {} : { username: 'Recommended' };
      };

      var Form = function (_Component36) {
        _inherits(Form, _Component36);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'username', component: usernameInput })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm',
        warn: warn
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // username input rendered
      expect(usernameInput).toHaveBeenCalled();
      expect(usernameInput.calls.length).toBe(1);

      // username field has warning
      expect(usernameInput.calls[0].arguments[0].meta.warning).toBe('Recommended');

      // update username field so it passes
      usernameInput.calls[0].arguments[0].input.onChange('erikras');

      // username input rerendered
      expect(usernameInput.calls.length).toBe(2);

      // should be valid now
      expect(usernameInput.calls[1].arguments[0].meta.warning).toBe(undefined);
    });

    it('should sync validate with field level validator', function () {
      var store = makeStore();
      var usernameInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var required = createSpy(function (value) {
        return value == null ? 'Required' : undefined;
      }).andCallThrough();

      var Form = function (_Component37) {
        _inherits(Form, _Component37);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'username', component: usernameInput, validate: required })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm'
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // username input rendered
      expect(usernameInput).toHaveBeenCalled();
      expect(usernameInput.calls.length).toBe(2);
      expect(required).toHaveBeenCalled();
      expect(required.calls.length).toBe(1);

      // username field has error
      expect(usernameInput.calls[1].arguments[0].meta.valid).toBe(false);
      expect(usernameInput.calls[1].arguments[0].meta.error).toBe('Required');

      // update username field so it passes
      usernameInput.calls[0].arguments[0].input.onChange('erikras');

      // username input rerendered
      expect(usernameInput.calls.length).toBe(3);

      // should be valid now
      expect(usernameInput.calls[2].arguments[0].meta.valid).toBe(true);
      expect(usernameInput.calls[2].arguments[0].meta.error).toBe(undefined);
    });

    it('should sync warn with field level warning function', function () {
      var store = makeStore();
      var usernameInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var required = createSpy(function (value) {
        return value == null ? 'Recommended' : undefined;
      }).andCallThrough();

      var Form = function (_Component38) {
        _inherits(Form, _Component38);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'username', component: usernameInput, warn: required })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm'
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      // username input rendered
      expect(usernameInput).toHaveBeenCalled();
      expect(usernameInput.calls.length).toBe(2);
      expect(required).toHaveBeenCalled();
      expect(required.calls.length).toBe(1);

      // username field has warning
      expect(usernameInput.calls[1].arguments[0].meta.valid).toBe(true);
      expect(usernameInput.calls[1].arguments[0].meta.warning).toBe('Recommended');

      // update username field so it passes
      usernameInput.calls[0].arguments[0].input.onChange('erikras');

      // username input rerendered
      expect(usernameInput.calls.length).toBe(3);

      // should be valid now
      expect(usernameInput.calls[2].arguments[0].meta.valid).toBe(true);
      expect(usernameInput.calls[2].arguments[0].meta.warning).toBe(undefined);
    });

    it('should not generate any warnings by passing api props into custom', function () {
      var store = makeStore();
      var renderSpy = createSpy();

      var InputComponent = function (_Component39) {
        _inherits(InputComponent, _Component39);

        function InputComponent() {
          _classCallCheck(this, InputComponent);

          return _possibleConstructorReturn(this, (InputComponent.__proto__ || Object.getPrototypeOf(InputComponent)).apply(this, arguments));
        }

        _createClass(InputComponent, [{
          key: 'render',
          value: function render() {
            renderSpy(this.props);
            return React.createElement('input', this.props.input);
          }
        }]);

        return InputComponent;
      }(Component);

      var apiProps = {
        // all the official API props you can pass to Field
        component: InputComponent,
        name: 'foo',
        normalize: function normalize(x) {
          return x;
        },
        parse: function parse(x) {
          return x;
        },
        props: {},
        format: function format(x) {
          return x;
        },
        validate: function validate() {
          return undefined;
        },
        warn: function warn() {
          return undefined;
        },
        withRef: true
      };

      var Form = function (_Component40) {
        _inherits(Form, _Component40);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, apiProps)
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({
        form: 'testForm'
      })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      expect(renderSpy).toHaveBeenCalled();
      var props = renderSpy.calls[0].arguments[0];
      Object.keys(apiProps).forEach(function (key) {
        return expect(props[key]).toNotExist();
      });
    });

    it('should only rerender field that has changed', function () {
      var store = makeStore();
      var input1 = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var input2 = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();

      var Form = function (_Component41) {
        _inherits(Form, _Component41);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'input1', component: input1 }),
              React.createElement(Field, { name: 'input2', component: input2 })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));
      expect(input1).toHaveBeenCalled();
      expect(input1.calls.length).toBe(1);
      expect(input1.calls[0].arguments[0].input.value).toBe('');

      expect(input2).toHaveBeenCalled();
      expect(input2.calls.length).toBe(1);
      expect(input2.calls[0].arguments[0].input.value).toBe('');

      // change input #1
      input1.calls[0].arguments[0].input.onChange('foo');

      // expect input #1 to have been rerendered
      expect(input1.calls.length).toBe(2);
      expect(input1.calls[1].arguments[0].input.value).toBe('foo');

      // expect input #2 to NOT have been rerendered
      expect(input2.calls.length).toBe(1);
    });

    it('should allow onChange callback', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy();

      var Form = function (_Component42) {
        _inherits(Form, _Component42);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onChange: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');
      input.value = 'bar';

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onChange prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onChange).toNotExist();

      TestUtils.Simulate.change(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist(); // event
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value changed
      expect(renderInput.calls.length).toBe(2);
      expect(renderInput.calls[1].arguments[0].input.value).toBe('bar');
    });

    it('should allow onChange callback to prevent change', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy(function (event) {
        return event.preventDefault();
      }).andCallThrough();

      var Form = function (_Component43) {
        _inherits(Form, _Component43);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onChange: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');
      input.value = 'bar';

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onChange prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onChange).toNotExist();

      TestUtils.Simulate.change(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist();
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value NOT changed
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].input.value).toBe('');
    });

    it('should allow onBlur callback', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy();

      var Form = function (_Component44) {
        _inherits(Form, _Component44);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onBlur: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');
      input.value = 'bar';

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onBlur prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onBlur).toNotExist();

      TestUtils.Simulate.blur(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist(); // event
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value changed
      expect(renderInput.calls.length).toBe(2);
      expect(renderInput.calls[1].arguments[0].input.value).toBe('bar');
    });

    it('should allow onBlur callback to prevent blur', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy(function (event) {
        return event.preventDefault();
      }).andCallThrough();

      var Form = function (_Component45) {
        _inherits(Form, _Component45);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onBlur: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');
      input.value = 'bar';

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onBlur prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onBlur).toNotExist();

      TestUtils.Simulate.blur(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist();
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value NOT changed
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].input.value).toBe('');
    });

    it('should allow onFocus callback', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy();

      var Form = function (_Component46) {
        _inherits(Form, _Component46);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onFocus: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onFocus prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onFocus).toNotExist();

      // not marked as active
      expect(renderInput.calls[0].arguments[0].meta.active).toBe(false);

      TestUtils.Simulate.focus(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist(); // event

      // field marked active
      expect(renderInput.calls.length).toBe(2);
      expect(renderInput.calls[1].arguments[0].meta.active).toBe(true);
    });

    it('should allow onFocus callback to prevent focus', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy(function (event) {
        return event.preventDefault();
      }).andCallThrough();

      var Form = function (_Component47) {
        _inherits(Form, _Component47);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onFocus: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onFocus prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onFocus).toNotExist();

      // not marked as active
      expect(renderInput.calls[0].arguments[0].meta.active).toBe(false);

      TestUtils.Simulate.focus(input);

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist();

      // field NOT marked active
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].meta.active).toBe(false);
    });

    it('should allow onDrop callback', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy();

      var Form = function (_Component48) {
        _inherits(Form, _Component48);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onDrop: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onDrop prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onDrop).toNotExist();

      TestUtils.Simulate.drop(input, {
        dataTransfer: { getData: function getData() {
            return 'bar';
          } }
      });

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist(); // event
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value changed
      expect(renderInput.calls.length).toBe(2);
      expect(renderInput.calls[1].arguments[0].input.value).toBe('bar');
    });

    it('should allow onDrop callback to prevent drop', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy(function (event) {
        return event.preventDefault();
      }).andCallThrough();

      var Form = function (_Component49) {
        _inherits(Form, _Component49);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onDrop: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');
      input.value = 'bar';

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onDrop prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onDrop).toNotExist();

      TestUtils.Simulate.drop(input, {
        dataTransfer: { getData: function getData() {
            return 'bar';
          } }
      });

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist();
      expect(callback.calls[0].arguments[1]).toBe('bar');
      expect(callback.calls[0].arguments[2]).toBe(undefined);

      // value NOT changed
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].input.value).toBe('');
    });

    it('should allow onDragStart callback', function () {
      var store = makeStore();
      var renderInput = createSpy(function (props) {
        return React.createElement('input', props.input);
      }).andCallThrough();
      var callback = createSpy();

      var Form = function (_Component50) {
        _inherits(Form, _Component50);

        function Form() {
          _classCallCheck(this, Form);

          return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
        }

        _createClass(Form, [{
          key: 'render',
          value: function render() {
            return React.createElement(
              'div',
              null,
              React.createElement(Field, { name: 'foo', component: renderInput, onDragStart: callback })
            );
          }
        }]);

        return Form;
      }(Component);

      var TestForm = reduxForm({ form: 'testForm' })(Form);
      var dom = TestUtils.renderIntoDocument(React.createElement(
        Provider,
        { store: store },
        React.createElement(TestForm, null)
      ));

      var input = TestUtils.findRenderedDOMComponentWithTag(dom, 'input');

      expect(callback).toNotHaveBeenCalled();

      // rendered once with no onDragStart prop passed down in custom props
      expect(renderInput.calls.length).toBe(1);
      expect(renderInput.calls[0].arguments[0].onDragStart).toNotExist();

      TestUtils.Simulate.dragStart(input, {
        dataTransfer: { setData: function setData() {} }
      });

      // call back was called
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(1);
      expect(callback.calls[0].arguments[0]).toExist(); // event

      // value NOT changed
      expect(renderInput.calls.length).toBe(1);
    });
  });
};

describeField('Field.plain', plain, plainCombineReducers, addExpectations(plainExpectations));
describeField('Field.immutable', immutable, immutableCombineReducers, addExpectations(immutableExpectations));