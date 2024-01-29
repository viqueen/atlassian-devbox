module.exports = {
    overrides: [
        {
            files: '*.js',
            options: {
                tabWidth: 4,
                singleQuote: true,
            },
        },
        {
            files: '*.ts',
            options: {
                tabWidth: 4,
                singleQuote: true,
                trailingComma: 'none',
            },
        },
        {
            files: '*.json',
            options: {
                trailingComma: 'none',
            },
        },
    ],
};
