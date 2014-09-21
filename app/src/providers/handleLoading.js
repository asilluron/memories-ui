define([], function () {
  function handleLoading() {
    return function (model, setLoading, setError, onLoaded) {
      setError(null);
      var promise = model && model.$promise;
      if (promise != null) {
        setLoading(true);
        promise.then(onLoaded, setError).finally(function () {
          setLoading(false);
        });
      } else {
        setLoading(false);
        onLoaded(model);
      }
      return model;
    };
  }

  return [handleLoading];
});