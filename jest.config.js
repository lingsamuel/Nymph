module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json'
        }
    },
    "name": "Nymph",
    "roots": [
        "./src"
    ],
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    }
}