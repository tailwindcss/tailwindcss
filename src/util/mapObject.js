export default (object, mapper) => Object.fromEntries(Object.entries(object).map(mapper))
