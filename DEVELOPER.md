# Developer documentation

No, you can't just run `npm it`, because that would be too easy:

do this and you should be 👌👌👌:

```
npm ci --ignore-scripts
npm test
npm run download-checksums
```