module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json'
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