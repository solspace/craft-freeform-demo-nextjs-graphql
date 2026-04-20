/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/craft/graphql/api',
                destination: 'https://craft4.ddev.site/graphql/api',
            },
            {
                source: '/craft/actions/freeform/submit',
                destination: 'https://craft4.ddev.site/actions/freeform/submit',
            },
            {
                source: '/craft/freeform/form/properties/:formId(\\d{1,})',
                destination: 'https://craft4.ddev.site/freeform/form/properties/:formId(\\d{1,})',
            },
        ];
    },
};

module.exports = nextConfig;
