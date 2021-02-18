# TODO

## Phase 1: Must do before go prod

1. (feat)   Mobile support.

## Phase 2: Can do after go prod

1. (feat)   Social share/like buttons on the project page and on the result page
            (see Next.js for SEO-friendly server-side rendering).
1. (feat)   Feedback page (+ GitHub link).
1. (feat)   FAQ page (e.g. will my project be visible to the world?).
1. (feat)   An option to archive the project (to make it read-only).
            Then it wouldn't be a problem to publish it to the world (check the entitlements!).
1. (fix)    Prevent from route navigation the same way as preventing from closing.
1. (feat)   Project creator can leave a comment for the repliers or for the prospect.
1. (feat)   Project creator can choose the start point of the video.
1. (refact) Clean up bin/server - move code to models.
1. (it)     LogRotate on the server.
1. (docs)   Installation/configuration instructions for this repo

## Phase 3: Backlog

1. (feat)   Ability to delete one of replies.
1. (feat)   Option to exclude the source recording from the compilation.
1. (feat)   Catch the "seek" player event during the response recording
            and display an error if it happens.
1. (feat)   Create a push stream with the compilation progress.
1. (fix)    Create normal "loading" view.
1. (feat)   Send the compiled video via Pitch.
1. (feat)   A video editor and captions for the project creator.
1. (feat)   Show the analytics for the compilation video.
1. (fix)    Install ffmpeg 4.3 locally and on the server
            and use the "fill" option of the xstack filter to set the background color.
1. (feat)   Authentication (via SSO?) and access restriction
1. (fix)    Persist camera/audio settings of the recorder.
