const schema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "required": [
        "$id",
        "objProperty",
        "simpleProperty",
        "arrProperty",
        "unchangedObjProperty",
        "unchangedSimpleProperty",
        "unchangedArrProperty"
    ],
    "properties": {
        "$id": {
            "type": "string"
        },
        "objProperty": {
            "type": "object",
            "default": {},
            "required": [
                "name",
                "value"
            ],
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            },
            "additionalProperties": true
        },
        "simpleProperty": {
            "$id": "#/properties/simpleProperty",
            "type": "string"
        },
        "arrProperty": {
            "$id": "#/properties/arrProperty",
            "type": "array",
            "default": [],
            "additionalItems": true,
            "items": {
                "type": "object",
                "default": {},
                "required": [
                    "name",
                    "value"
                ],
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    }
                },
                "additionalProperties": true
            }
        },
        "unchangedObjProperty": {
            "type": "object",
            "default": {},
            "required": [
                "name",
                "value"
            ],
            "properties": {
                "name": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            },
            "additionalProperties": true
        },
        "unchangedSimpleProperty": {
            "type": "string"
        },
        "unchangedArrProperty": {
            "type": "array",
            "default": [],
            "required": [
                "name",
                "value"
            ],
            "additionalItems": true,
            "items": {
                "type": "object",
                "default": {},
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "value": {
                        "type": "string"
                    }
                }
            }
        }
    },
    "additionalProperties": true
}

const a = {
    "$id": "ObjectA",
    "objProperty": {
        "name": "objProperty.value Name(ObjectA)",
        "value": "objProperty.value Value(ObjectA)",
    },
    "simpleProperty": "simpleProperty Value(ObjectA)",
    "arrProperty": [
        {
            "name": "arrProperty/0.name Name(ObjectA)",
            "value": "arrProperty/0.value Value(ObjectA)",
        },
        {
            "name": "arrProperty/1.name Name(ObjectA)",
            "value": "arrProperty/1.value Value(ObjectA)",
        }
    ],
    "unchangedObjProperty": {
        "name": "unchangedObjProperty.value Name(ObjectA)",
        "value": "unchangedObjProperty.value Value(ObjectA)",
    },
    "unchangedSimpleProperty": "unchangedSimpleProperty Value(ObjectA)",
    "unchangedArrProperty": [
        {
            "name": "unchangedArrProperty/0.name Name(ObjectA)",
            "value": "unchangedArrProperty/0.value Value(ObjectA)",
        },
        {
            "name": "unchangedArrProperty/1.name Name(ObjectA)",
            "value": "unchangedArrProperty/1.value Value(ObjectA)",
        }
    ]
};

const b = {
    "$id": "ObjectB",
    "objProperty": {
        "name": "objProperty.name Name(ObjectB)",
        "value": "objProperty.value Value(ObjectB)",
    },
    "simpleProperty": "simpleProperty Value(ObjectB)",
    "arrProperty": [
        {
            "name": "arrProperty/0.name Name(ObjectB)",
            "value": "arrProperty/0.value Value(ObjectB)",
        },
        {
            "name": "arrProperty/1.name Name(ObjectB)",
            "value": "arrProperty/1.value Value(ObjectB)",
        }
    ],
    "unchangedObjProperty": {
        "name": "unchangedObjProperty.name Name(ObjectB)",
        "value": "unchangedObjProperty.value Value(ObjectB)",
    },
    "unchangedSimpleProperty": "unchangedSimpleProperty Value(ObjectB)",
    "unchangedArrProperty": [
        {
            "name": "unchangedArrProperty/0.name Name(ObjectB)",
            "value": "unchangedArrProperty/0.value Value(ObjectB)",
        },
        {
            "name": "unchangedArrProperty/1.name Name(ObjectB)",
            "value": "unchangedArrProperty/1.value Value(ObjectB)",
        }
    ]
};

const patch = {
    "$id": "ObjectPatch",
    "$remove": [
        "unchangedObjProperty"
    ],
    "objProperty": {
        "$import": "ObjectB.objProperty",
        "$import-path": [
            "name"
        ],
        "$strategy": "merge", // default value
    },
    "simpleProperty": "simpleProperty Value Patched",
    "arrProperty": {
        "$strategy-list": "append",
        "$value": [
            {
                "$import": "ObjectB.arrProperty/0",
            }
        ]
    },
    "unchangedArrProperty": {
        "$value": {
            "$import": "ObjectB.unchangedArrProperty",
        }
    }
};