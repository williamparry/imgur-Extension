# imgur Extension by Metronomik #

**Licensed under BSD License**

This is the repository for the [imgur Chrome Extension](https://chrome.google.com/webstore/detail/imgur/ehoopddfhgaehhmphfcooacjdpmbjlao).

Any questions flick me an [email](mailto:william@metronomik.com) or [tweet](https://twitter.com/williamparry)

## Translators ##

We'd really like to get this extension translated into as many languages as we can. If you're willing to help out please send us a message.

### How to submit a bug ###

* Disable the existing imgur extension while running this one.

* Please include what operating system you're using, what version of Chrome and any console errors from the [Developer Tools](https://developers.google.com/chrome-developer-tools/).

* Some bugs may cascade and break other functionality, so when something is logged as fixed please reload the extension (refresh the chrome://extensions page) before retesting.

### Current testers ###

* https://github.com/Jobeanie123
* https://github.com/jmlind
* https://github.com/wrouesnel

## Developers ##

The project is open source, so if you want to fix bugs or implement new features flick me a message and I'll show you the ropes. It's pretty straightforward with abstracted calls such as:

    model.authenticated.fetchUserImages().addEventListener('EVENT_SUCCESS', function (images) { } );

Similarly, if you're an extension developer and would like to hook your extension up with mine for extra imgur awesomeness, let me know and we'll work out the interop.

## Partners ##

Lloyd from [glyphlibrary 4](http://www.glyphlibrary.com/) will be supplying the icons and screens for the extension.