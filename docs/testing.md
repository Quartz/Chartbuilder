# Chartbuilder tests

### Unit tests

To run the unit tests, do:

		npm test

Tests are written using [tape](https://github.com/substack/tape) which has its
output piped to [smokestack](https://github.com/hughsk/smokestack). Pure
JavaScript and JSX-reliant modules can be tested independently, with `npm run
test:js` and `npm run test:jsx`.

If you make a change, consider adding a test!

### Chart test page

There is also a chart test page that renders various charts at different sizes.
This is helpful if you need to quickly see how your changes look or if they are
breaking anything. To run this page, do:

		npm run test-page

And open your browser to the URL that appears in the console, usually
`http://localhost:3000`.
