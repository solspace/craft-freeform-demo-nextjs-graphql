/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/graphql/api',
                destination: 'https://www.example.com/graphql/api',
            },
            {
                source: '/actions/freeform/submit',
                destination: 'https://www.example.com/actions/freeform/submit',
            },
            {
                source: '/my-module/freeform/form-properties/:formId(\\d{1,})',
                destination: 'https://www.example.com/my-module/freeform/form-properties/:formId(\\d{1,})',
            },
        ];
    },
};

module.exports = nextConfig;
