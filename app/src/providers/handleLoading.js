define([], function () {
  function handleLoading() {
    return function (model, setLoading, setError) {
      setError(null);
      var promise = model && model.$promise;
      if (promise != null) {
        setLoading(true);
        promise.then(null, setError).finally(function () {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
      return model;
    }
  }

  return [handleLoading];
});