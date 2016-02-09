# Contributing

We're happy that you'd like to contribute to Chartbuilder! Here are a couple
general rules to follow if you'd like to add a feature or fix a bug.

#### 0. (Optional) Open an issue or empty PR to discuss the feature and possible implementation.

#### 1. Name your feature branch something descriptive

```
git checkout -b test-page-improvements
```

#### 2. Rebase and squash all of your commits into a single commit for that feature.*

Here is how to do that:

*2a* – Make some commits

Your `git log` may look something like this:

```
commit b33c4e0f03d6bddada348f080c837c7f91c2f78a
Author: nsonnad
Date:   Tue Jan 26 14:50:13 2016 -0500

change test page naming to make more clear; render fewer charts

commit b33c4e0f03d6bddada348f080c837c7f91c2f78a
Author: nsonnad
Date:   Tue Jan 26 14:50:13 2016 -0500

clean up test page styles

commit b33c4e0f03d6bddada348f080c837c7f91c2f78a
Author: nsonnad
Date:   Tue Jan 26 14:50:13 2016 -0500

document testing; fix ref to test_charts.json

commit b33c4e0f03d6bddada348f080c837c7f91c2f78a
Author: nsonnad
Date:   Tue Jan 26 14:50:13 2016 -0500

add testing.md
```

*2b* – Once the feature is ready, do `git rebase -i HEAD~N`, where `N` is the number
of commits to mash together

*2c* – Git will display something like this, showing each of those commits.

```
pick 6149757 add testing.md
pick 5201f42 document testing; fix ref to test_charts.json
pick 667494c lean up test page styles
pick b33c4e0 change test page naming to make more clear; render fewer charts
```

Change all of those `pick` to `squash` or `s`:

```
s 6149757 add testing.md
s 5201f42 document testing; fix ref to test_charts.json
s 667494c lean up test page styles
s b33c4e0 change test page naming to make more clear; render fewer charts
```

*2d* – Save and exit, and include a new master commit message for this feature.
You are now rebased in a single commit!

*2e* – Finally, push back to your feature branch.

```sh
# (optional) you may want to amend your commit message before pushing
> git commit --amend

# you will have to force push to your branch now
> git push origin <branch-name> --force
```

#### 3. Submit your pull request!

*Why a single commit? Many people out there have slightly modified forks/versions of Chartbuilder.
That means that new features can cause ugly merge conflicts since some parts of
the code are meant to differ across forks. The best way for new features
to work well with the [recommended workflow](docs/git-workflow-forks.md) for Chartbuilder
forks is to create a single commit that can be pulled in with `git cherry-pick`.
