import { unregisterField } from '../actions';

var describeUnregisterField = function describeUnregisterField(reducer, expect, _ref) {
  var fromJS = _ref.fromJS;
  return function () {
    it('should remove a field from registeredFields', function () {
      var state = reducer(fromJS({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'field', count: 1 } }
        }
      }), unregisterField('foo', 'bar'));
      expect(state).toEqualMap({
        foo: {}
      });
    });

    it('should do nothing if there are no registered fields', function () {
      var initialState = fromJS({
        foo: {}
      });
      var state = reducer(initialState, unregisterField('foo', 'bar'));
      expect(state).toEqual(initialState);
    });

    it('should do nothing if the field is not registered', function () {
      var state = reducer(fromJS({
        foo: {
          registeredFields: {
            bar: { name: 'bar', type: 'Field', count: 1 }
          }
        }
      }), unregisterField('foo', 'baz'));
      expect(state).toEqualMap({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'Field', count: 1 } }
        }
      });
    });

    it('should set count to zero when not destroyOnUnmount', function () {
      var state = reducer(fromJS({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'field', count: 1 } }
        }
      }), unregisterField('foo', 'bar', false));
      expect(state).toEqualMap({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'field', count: 0 } }
        }
      });
    });

    it('should decrease count if the field is registered multiple times', function () {
      var state = reducer(fromJS({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'field', count: 8 } }
        }
      }), unregisterField('foo', 'bar'));
      expect(state).toEqualMap({
        foo: {
          registeredFields: { bar: { name: 'bar', type: 'field', count: 7 } }
        }
      });
    });
  };
};

export default describeUnregisterField;