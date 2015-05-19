/**
 * Sets a property from one object to another, trying to preserve the 'observability' of the objects
 * @param property
 * @param src
 * @param target
 */
function setObservableProperty(property, src, target) {
    if(typeof src[property] === 'undefined') {
        return;
    }
    if(ko.isObservable(src[property])) {
        target[property] = src[property];
        return;
    }
    target[property](src[property]);
}

/**
 * Creates an observable based on the value supplied
 * @param value - Either a value or an observable
 * @returns {*} - If value is observable already, returns value.  Otherwise wraps value in an observable.
 */
function createObservable(value) {
    return ko.isObservable(value) ? value : ko.observable(value);
}

function initBindingHandler(Type, initMethod) {
    return function (element, valueAccessor, allBindings) {
        var params = valueAccessor(),
            instance;

        instance = (params instanceof Type) ? params : new Type();
        initMethod = initMethod || 'init';

        return instance[initMethod](element, valueAccessor, allBindings);
    };
}

function closestMarker(element, marker) {
    return $(element).closest('[data-marker="' + marker + '"]')[0];
}