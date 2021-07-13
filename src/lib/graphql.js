const {
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLScalarType,
  isListType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  isDirective: isDirectiveType,
  getNamedType,
  isScalarType,
  isEnumType,
  isUnionType,
  isInterfaceType,
  isObjectType,
  isInputObjectType: isInputType,
  isNullableType,
  printSchema,
} = require("graphql");
const { loadSchema } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { UrlLoader } = require("@graphql-tools/url-loader");
const { JsonFileLoader } = require("@graphql-tools/json-file-loader");
const { hasMethod, hasProperty } = require("./utils");

const SCHEMA_EXCLUDE_LIST_PATTERN =
  /^(?!Query$|Mutation$|Subscription$|__.+$).*$/;

function getDefaultValue(argument) {
  if (
    argument.defaultValue === null ||
    typeof argument.defaultValue === "undefined"
  ) {
    return undefined;
  }

  if (isListType(argument.type)) {
    const defaultValues = Array.isArray(argument.defaultValue)
      ? argument.defaultValue
      : [argument.defaultValue];

    const defaultValuesString = defaultValues
      .map((defaultValue) => {
        return printDefaultValue(argument.type.ofType, defaultValue);
      })
      .join(", ");

    return `[${defaultValuesString}]`;
  }

  return printDefaultValue(argument.type, argument.defaultValue);
}

function printDefaultValue(type, value) {
  if (isEnumType(type)) {
    return value;
  }

  switch (type) {
    case GraphQLInt:
    case GraphQLFloat:
    case GraphQLBoolean:
      return value;
    case GraphQLID:
    case GraphQLString:
    default:
      return `"${value}"`;
  }
}

function getFilteredTypeMap(
  typeMap,
  excludeList = SCHEMA_EXCLUDE_LIST_PATTERN,
) {
  if (!typeMap) return undefined;
  return Object.keys(typeMap)
    .filter((key) => excludeList.test(key))
    .reduce((res, key) => ((res[key] = typeMap[key]), res), {});
}

function getIntrospectionFieldsList(queryType) {
  if (!queryType && !hasMethod(queryType, "getFields")) {
    return undefined;
  }
  return queryType.getFields();
}

function getFields(type) {
  if (!hasMethod(type, "getFields")) {
    return [];
  }
  const fieldMap = type.getFields();
  return Object.keys(fieldMap).map((name) => fieldMap[name]);
}

function getTypeName(type, defaultName = "") {
  if (!type) {
    return undefined;
  }
  return (
    (hasProperty(type, "name") && type.name) ||
    (hasMethod(type, "toString") && type.toString()) ||
    defaultName
  );
}

function getTypeFromTypeMap(typeMap, type) {
  if (!typeMap) return undefined;
  return Object.keys(typeMap)
    .filter((key) => typeMap[key] instanceof type)
    .reduce((res, key) => ((res[key] = typeMap[key]), res), {});
}

function getSchemaMap(schema) {
  const typeMap = getFilteredTypeMap(schema.getTypeMap());
  return {
    queries: getIntrospectionFieldsList(
      schema.getQueryType && schema.getQueryType(),
    ),
    mutations: getIntrospectionFieldsList(
      schema.getMutationType && schema.getMutationType(),
    ),
    subscriptions: getIntrospectionFieldsList(
      schema.getSubscriptionType && schema.getSubscriptionType(),
    ),
    directives: schema.getDirectives(),
    objects: getTypeFromTypeMap(typeMap, GraphQLObjectType),
    unions: getTypeFromTypeMap(typeMap, GraphQLUnionType),
    interfaces: getTypeFromTypeMap(typeMap, GraphQLInterfaceType),
    enums: getTypeFromTypeMap(typeMap, GraphQLEnumType),
    inputs: getTypeFromTypeMap(typeMap, GraphQLInputObjectType),
    scalars: getTypeFromTypeMap(typeMap, GraphQLScalarType),
  };
}

function isParametrizedField(field) {
  return hasProperty(field, "args") && field.args.length > 0;
}

function isOperation(query) {
  return hasProperty(query, "type");
}

module.exports = {
  loadSchema,
  GraphQLFileLoader,
  UrlLoader,
  JsonFileLoader,
  isDirectiveType,
  isObjectType,
  getNamedType,
  isScalarType,
  isEnumType,
  isUnionType,
  getSchemaMap,
  getTypeName,
  isParametrizedField,
  getFields,
  getDefaultValue,
  isOperation,
  isInterfaceType,
  isInputType,
  isNullableType,
  isListType,
  printSchema,
  getFilteredTypeMap,
  getIntrospectionFieldsList,
  getTypeFromTypeMap,
  SCHEMA_EXCLUDE_LIST_PATTERN,
};
