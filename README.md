# authors [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![npm Downloads](https://img.shields.io/npm/dm/authors.svg)](https://www.npmjs.com/package/authors)

Generates a list of authors/contributors of an git repository with
GitHub links.

## Installation

```
$ npm -g install authors
```


## Usage

```
$ cd my-git-repo
$ authors
```

### Optional Authentication

To get around GitHub's API rate limiting you can provide a personal
OAuth2 access token, e.g.

```
$ OAUTH_TOKEN=43db965473740003c87b6467dd7aed645f832d1c authors
```

> You can create and revoke
> [personal access tokens in your account settings](https://github.com/settings/tokens).
> For this use case no special permissions are required, so `public
> access` is sufficient.

## Authors

Ordered by date of first contribution.
[Auto-generated](https://github.com/dtrejo/node-authors) on Tue, 06 Dec
2016 07:28:57 GMT.

- [David Trejo](https://github.com/DTrejo) aka `DTrejo`
- [XiNGRZ](https://github.com/xingrz) aka `xingrz`
- [Björn Kimminich](https://github.com/bkimminich) aka `bkimminich`

## Hacking

### Reporting a bug

If you meet a bug or get confused, please let us know by
[firing a Issue](https://github.com/DTrejo/node-authors/issues/new).

### Developing

```
$ git clone https://github.com/DTrejo/node-authors.git
$ cd node-authors
$ npm link
```

- The latest version is placed on master branch.
- Releases is tagged with its version number (e.g. `v0.0.2`).
- Features working in progress is developed on separate branches. Once
  it is finished and tested, it would be merged into master branch.

### Testing

_TODO: tests is still missing..._

```
$ npm test
```

### Committing a patch

It would be great to develop on a separate branch instead of the master
branch. Before making a Pull Request, please confirm all tests is
passed.

If it is a bugfix, please also write a test case that proves the bug.

### Any ideas?

Please feel free to share your ideas with us via
[Issues](https://github.com/DTrejo/node-authors/issues).


## License

**authors** is available under the terms of the [MIT License](LICENSE).
