# `rs-fmt-check` Action

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/clechasseur/rs-fmt-check/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/clechasseur/rs-fmt-check/actions/workflows/ci.yml)

> Rustfmt suggestions in your Pull Requests

This GitHub Action executes [`rustfmt`](https://github.com/rust-lang/rustfmt)
and posts all suggestions as annotations for the pushed commit [<sup>2</sup>](#note-annotations-limit).

![Screenshot of a rustfmt suggestion displayed in the commit interface of GitHub](./.github/screenshot_fmt.png)

This GitHub Action is based on [clechasseur/rs-clippy-check](https://github.com/clechasseur/rs-clippy-check), which itself has been forked from [actions-rs/clippy-check](https://github.com/actions-rs/clippy-check). See [LICENSE](LICENSE) for copyright attribution details.

## Example workflow

Note: this workflow uses [`actions-rust-lang/setup-rust-toolchain`](https://github.com/actions-rust-lang/setup-rust-toolchain) to install the most recent `nightly` rustfmt [<sup>1</sup>](#note-nightly-requirement).

```yaml
name: Rustfmt check

on: push

jobs:
  rustfmt_check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: nightly
          components: rustfmt
      - uses: clechasseur/rs-fmt-check@v2
```

## Inputs

All inputs are optional.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| `toolchain` | Rust toolchain to use [<sup>1</sup>](#note-nightly-requirement) | string | `nightly` |
| `args` | Arguments for the `cargo fmt` command | string |         |
| `working-directory` | Directory where to perform the `cargo fmt` command | string |         |

For extra details about the `toolchain` and `args` inputs, see [`rs-cargo` Action](https://github.com/clechasseur/rs-cargo#inputs).

## Notes

<a name="note-nightly-requirement"><sup>1</sup></a> : This action currently relies on an unstable `rustfmt` feature (`emit json`) and as such, requires a `nightly` toolchain at the minimum. You should not change the value of the `toolchain` parameter unless you know the specified toolchain supports the feature correctly.

<a name="note-annotations-limit"><sup>2</sup></a> : Currently, GitHub sets a limit of 10 warning annotations per run (see [this page](https://docs.github.com/en/rest/checks/runs?apiVersion=2022-11-28) for more information). So if there are more than 10 suggestions returned by `rustfmt`, only the first 10 will appear as PR annotations. The other suggestions will still appear in the check run summary (see [this one](https://github.com/clechasseur/rs-fmt-check/actions/runs/5886828621/attempts/1#summary-15965282231) for example).
