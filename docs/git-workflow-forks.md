# Git workflow for maintaining a Chartbuilder fork

Chartbuilder is meant to be customized, so merging in changes from the master
repo can be a bit tricky and cause very bad merge conflicts. To make this as
seamless as possible, we suggest using merges based on [`git cherry-pick`][1].

This is one of the main reasons why we ask that contributors submit
[single-commit pull requests](../CONTRIBUTING.md).

We will try to keep all single features in the form of a single commit. To merge
(or cherry-pick) one of these commits, set yourself up like so:

```sh
# add master chartbuilder to your repo as `upstream`
> git remote add upstream git@github.com:Quartz/Chartbuilder.git

# fetch upstream
> git fetch upstream

# view the log of the upstream to identify the commit you need
> git log upstream/master

------------------------------------------
commit b33c4e0f03d6bddada348f080c837c7f91c2f78a
Author: nsonnad
Date:   Tue Jan 26 14:50:13 2016 -0500

    improvements to chart test page: use responsive styles, update react

    change test page naming to make more clear; render fewer charts

    clean up test page styles

    document testing; fix ref to test_charts.json

    add testing.md

    Improve and document chart test page
------------------------------------------

# cherry pick the commit
> git cherry-pick b33c4e0f03d6bddada348f080c837c7f91c2f78a
```

This means that only the changes from _that_ commit will be brought over, and
git will not try to resolve the entire history, meaning your long-term
divergences from the main repo will not cause conflicts.

[1]: https://git-scm.com/docs/git-cherry-pick
