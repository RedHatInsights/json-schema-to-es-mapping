const { create, opts } = require("./helpers");
describe("create entryObj", () => {
  describe("default", () => {
    describe("no init", () => {
      const mapper = create(opts);
      test("is undefined before init", () => {
        expect(mapper.entryObj).toBeUndefined();
      });
    });

    describe("init", () => {
      describe("initEntryObj", () => {
        const mapper = create(opts);
        mapper.initEntryObj();

        test("is function", () => {
          expect(typeof mapper.entryObj).toEqual("object");
        });
      });
    });
    describe("passed in config", () => {});
  });
});
