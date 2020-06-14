export const Config = {
    // MongoUri: 'mongodb+srv://dev:whitedog@cluster0-5wemb.mongodb.net?retryWrites=true&w=majority',
    MongoUri: 'mongodb://localhost:27017',
    MongoConfig: {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    },
    MongoDatabase: 'party-haan',
    Port: 3000,

    FilePath: '/images',
    ImagePath: '//localhost:3000/images',
    PageSize: 10,
    ExpiresIn: 3600 * 100,

    AppName: 'Party Hann API',

    Version: {
        base: 0,
        major: 0,
        minor: 1
    }
};

export const ConfigTest = {
    MongoUri: 'mongodb://localhost:27017',
    MongoConfig: {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    },
    MongoDatabase: 'party-haan_test',
    Port: 3001,

    FilePath: '/images',
    ImagePath: '//localhost:3000/images',
    PageSize: 10,
    ExpiresIn: 3600 * 100,

    AppName: 'Party Hann API Test',

    Version: {
        base: 0,
        major: 0,
        minor: 1
    }
};

