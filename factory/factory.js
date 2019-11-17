function factory(attrs) {
  for (let name in attrs) {
    this[name] = attrs[name];
  }
}

factory.build = function (attrs) {
  return new factory(attrs);
};

factory.build = function (attrs) {
  if (arguments.length === 2) {
    attrs = {
      name: arguments[0],
      data: arguments[1]
    };
  }

  return new factory(attrs);
};
