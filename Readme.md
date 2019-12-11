# What is this extension?

SwitchIt! is an Chrome extension which switches your current URL with pre-defined URLs.

In your local development let's imagine there are 6 different domains and each time you 
want to visit one other domain, it could be hard to rename URL.

Current URL: www.domain.local/1/2/3/4

Destination URL: www.domain.com/1/2/3/4

# Chrome Extension

https://chrome.google.com/webstore/detail/switch-it/cdpebegipedoolgclhigpccflngpljcl

# How to install?

1 - Install yarn

```
brew update
brew install yarn
```

2 - Clone the repository
```
git clone https://github.com/onurdegerli/switchit.git
```

3 - Install npm packages
```
cd ~/switchit
yarn install
```

4 - Build packages for production.
```
yarn build
```

5 - Run yarn for local development.
```
yarn start
```

Visit local page: http://localhost:8080 for index

http://localhost:8080/settings.html for option page