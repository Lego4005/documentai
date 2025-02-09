const testContext = {
  ...(await ContextManager.createContext('test')),
};

const updatedContext = {
  ...(await ContextManager.updateContextMetadata('session123')),
};

export { };

