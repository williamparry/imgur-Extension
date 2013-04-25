# imgur Extension by Metronomik #

**Licensed under BSD License**

This is the new repository for the [imgur Chrome Extension](https://chrome.google.com/webstore/detail/imgur/ehoopddfhgaehhmphfcooacjdpmbjlao) and will be supported into the future.

There are no major User Interface differences in the 1.2 release - this release being an update to handle new Chrome and imgur APIs.

Looking forward to future releases, we are thinking of adding comment notifications (using the new Chrome notifications API) and a few statistics to the User Interface.

## Developers ##

The project is open source, so if you want to fix bugs or implement new features flick me a message and I'll show you the ropes. It's pretty straightforward with abstracted calls such as:

    model.authenticated.fetchUserImages().addEventListener('EVENT_SUCCESS', function (images) { } );

Similarly, if you're an extension developer and would like to hook your extension up with mine for extra imgur awesomeness, let me know and we'll work out the interop.

## Testers ##

Disable the existing imgur extension while running this one.

When submitting bug reports please include what operating system you're using, what version of Chrome and any console errors from the [Developer Tools](https://developers.google.com/chrome-developer-tools/).

Some bugs may cascade and break other functionality, so when something is logged as fixed please reload the extension (refresh the chrome://extensions page) before retesting.

Thanks heaps!

### Current testers ###

* https://github.com/Jobeanie123

## Partners ##

Lloyd from [glyphlibrary 4](http://www.glyphlibrary.com/) will be supplying the icons and screens for the extension.



---
This document was created with [MarkdownPad](http://markdownpad.com), the Markdown editor for Windows
