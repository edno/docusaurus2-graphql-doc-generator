const { loadSchema } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const {
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLID,
  GraphQLFloat,
  GraphQLString,
  GraphQLList,
} = require("graphql");

const {
  getDefaultValue,
  getFilteredTypeMap,
  getIntrospectionFieldsList,
  getFields,
  getTypeName,
  getTypeFromTypeMap,
  getSchemaMap,
  isParametrizedField,
  isOperation,
} = require("../../../src/lib/graphql");

const SCHEMA_FILE = require.resolve("@data/tweet.graphql");

describe("lib", () => {
  describe("graphql", () => {
    let schema;

    beforeAll(async () => {
      schema = await loadSchema(SCHEMA_FILE, {
        loaders: [new GraphQLFileLoader()],
      });
    });

    describe("getDefaultValue()", () => {
      test("returns default value as an integer when defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLInt,
          defaultValue: 5,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBe(5);
      });

      test("returns default value as a float when defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLFloat,
          defaultValue: 5.3,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBe(5.3);
      });

      test("returns undefined for type GraphQLInt if not default value defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLInt,
          defaultValue: undefined,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBeUndefined();
      });

      test("returns undefined for type GraphQLID if not default value defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLID,
          defaultValue: undefined,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBeUndefined();
      });

      test("returns undefined for type GraphQLFloat if not default value defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLFloat,
          defaultValue: undefined,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBeUndefined();
      });

      test("returns undefined for type GraphQLString if not default value defined", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: GraphQLString,
          defaultValue: undefined,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBeUndefined();
      });

      test("returns undefined for type GraphQLList without default value", () => {
        const argument = {
          name: "id",
          description: undefined,
          type: new GraphQLList(GraphQLID),
          defaultValue: undefined,
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBeUndefined();
      });

      test("returns array default value as string for type GraphQLList(GraphQLID)", () => {
        const argument = {
          name: "id",
          description: undefined,
          type: new GraphQLList(GraphQLID),
          defaultValue: ["0", "1"],
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBe('["0", "1"]');
      });

      test("returns array default value as string for type GraphQLList(GraphQLInt)", () => {
        const argument = {
          name: "foobar",
          description: undefined,
          type: new GraphQLList(GraphQLInt),
          defaultValue: [0, 1],
          extensions: undefined,
        };
        expect(getDefaultValue(argument)).toBe("[0, 1]");
      });
    });

    describe("getFilteredTypeMap()", () => {
      test("returns a filtered map of schema types", () => {
        const schemaTypeMap = getFilteredTypeMap(schema.getTypeMap());
        expect(schemaTypeMap).toMatchSnapshot();
      });
    });

    describe("getIntrospectionFieldsList()", () => {
      test("returns list of queries", () => {
        const list = getIntrospectionFieldsList(schema.getQueryType());
        expect(list).toMatchSnapshot();
      });

      test("returns list of mutations", () => {
        const list = getIntrospectionFieldsList(schema.getMutationType());
        expect(list).toMatchSnapshot();
      });

      test("returns list of subscriptions", () => {
        const list = getIntrospectionFieldsList(schema.getSubscriptionType());
        expect(list).toMatchSnapshot();
      });

      test("returns undefined if null", () => {
        const list = getIntrospectionFieldsList(null);
        expect(list).toBeUndefined();
      });
    });

    describe("getFields()", () => {
      test("returns list of type fields", () => {
        const fields = getFields(schema.getMutationType());
        expect(fields).toMatchSnapshot();
      });
    });

    describe("getTypeName()", () => {
      test("returns type name for object", () => {
        const name = getTypeName(schema.getType("Tweet"));
        expect(name).toBe("Tweet");
      });

      test("returns type name for interface", () => {
        const name = getTypeName(schema.getType("Node"));
        expect(name).toBe("Node");
      });

      test("returns type name for scalar", () => {
        const name = getTypeName(schema.getType("ID"));
        expect(name).toBe("ID");
      });

      test("returns default name for unknown", () => {
        const name = getTypeName({ toString: undefined }, "FooBar");
        expect(name).toBe("FooBar");
      });
    });

    describe("getTypeFromTypeMap()", () => {
      test("returns a filter map filtered by GraphQLObjectType", () => {
        const list = getTypeFromTypeMap(schema.getTypeMap(), GraphQLObjectType);
        expect(list).toMatchSnapshot();
      });

      test("returns a filter map filtered by GraphQLUnionType", () => {
        const list = getTypeFromTypeMap(schema.getTypeMap(), GraphQLUnionType);
        expect(list).toMatchSnapshot();
      });

      test("returns a filter map filtered by GraphQLInterfaceType", () => {
        const list = getTypeFromTypeMap(
          schema.getTypeMap(),
          GraphQLInterfaceType,
        );
        expect(list).toMatchSnapshot();
      });

      test("returns a filter map filtered by GraphQLEnumType", () => {
        const list = getTypeFromTypeMap(schema.getTypeMap(), GraphQLEnumType);
        expect(list).toMatchSnapshot();
      });

      test("returns a filter map filtered by GraphQLInputObjectType", () => {
        const list = getTypeFromTypeMap(
          schema.getTypeMap(),
          GraphQLInputObjectType,
        );
        expect(list).toMatchSnapshot();
      });

      test("returns a filter map filtered by GraphQLScalarType", () => {
        const list = getTypeFromTypeMap(schema.getTypeMap(), GraphQLScalarType);
        expect(list).toMatchSnapshot();
      });
    });

    describe("getSchemaMap()", () => {
      test("returns schema types map", () => {
        const schemaTypeMap = getSchemaMap(schema);
        expect(schemaTypeMap).toMatchSnapshot();
      });
    });

    describe("isParametrizedField()", () => {
      test("returns true if type is parametrized", () => {
        const mutations = getIntrospectionFieldsList(schema.getMutationType());
        const res = isParametrizedField(mutations["createTweet"]);
        expect(res).toBeTruthy();
      });

      test("returns false if type is not parametrized", () => {
        const queries = getIntrospectionFieldsList(schema.getQueryType());
        const res = isParametrizedField(queries["TweetsMeta"]);
        expect(res).toBeFalsy();
      });
    });

    describe("isOperation()", () => {
      test("returns true if type is mutation", () => {
        const mutations = getIntrospectionFieldsList(schema.getMutationType());
        const res = isOperation(mutations["createTweet"]);
        expect(res).toBeTruthy();
      });

      test("returns true if type is query", () => {
        const queries = getIntrospectionFieldsList(schema.getQueryType());
        const res = isOperation(queries["Tweets"]);
        expect(res).toBeTruthy();
      });

      test("returns true if type is subscription", () => {
        const subscriptions = getIntrospectionFieldsList(
          schema.getSubscriptionType(),
        );
        const res = isOperation(subscriptions["Notifications"]);
        expect(res).toBeTruthy();
      });

      test("returns false if type is not an operation", () => {
        const objects = getTypeFromTypeMap(
          schema.getTypeMap(),
          GraphQLObjectType,
        );
        const res = isOperation(objects["Tweet"]);
        expect(res).toBeFalsy();
      });
    });
  });
});
