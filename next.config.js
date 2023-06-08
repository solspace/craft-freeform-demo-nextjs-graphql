/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/graphql/api',
                destination: 'https://demo.solspace.net/craft/graphql/api',
            },
            {
                source: '/actions/freeform/submit',
                destination: 'https://demo.solspace.net/craft/actions/freeform/submit',
            },
            {
                source: '/freeform/form/properties/:formId(\\d{1,})',
                destination: 'https://demo.solspace.net/craft/freeform/form/properties/:formId(\\d{1,})',
            },
        ];
    },
};

module.exports = nextConfig;
