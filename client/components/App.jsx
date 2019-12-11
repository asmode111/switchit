import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, 
         Container, Row, Col } from 'reactstrap';

class App extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleBrowserTabChange = this.handleBrowserTabChange.bind(this);
        this.handleUserAgentChange = this.handleUserAgentChange.bind(this);

        this.state = {
            browserTab: 'currentTab',
            userAgent: null,
            browserWidth: null,
            browserHeight: null,
            showUserAgent: true
        }
    }

    handleChange(e) {
        e.preventDefault();
        let env = e.target.value,
            url,
            redirectUrl,
            currentDomain,
            browserTab = this.state.browserTab,
            browserWidth = this.state.browserWidth,
            browserHeight = this.state.browserHeight,
            projects = this.props.projects,
            isExistingDomain = false,
            envProjectName;

        this.changeBrowserUserAgent();

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {

            projects.forEach(function(project) {
                project.environments.forEach(function(environment){
                    if ( environment['domain'] == env ) {
                        envProjectName = project['name'];
                        return;
                    }
                });
            });

            currentDomain = tabs[0].url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
            projects.forEach(function(project) {
                if ( project['name'] == envProjectName ) {
                    project.environments.forEach(function(environment){
                        if ( environment['domain'] == currentDomain ) {
                            isExistingDomain = true;
                            return;
                        }
                    });
                }
            });

            if ( isExistingDomain == false ) {
                redirectUrl = env;
            } else {
                redirectUrl = tabs[0].url.replace(currentDomain, env);
            }

            if ( browserTab == 'currentTab' ) {
                chrome.tabs.update({ 
                    url: redirectUrl
                });
                chrome.windows.getLastFocused({
                        populate: false
                    }, function(currentWindow) {
                        chrome.windows.update(
                            chrome.windows.WINDOW_ID_CURRENT, {
                                width: browserWidth,
                                height: browserHeight 
                            }
                        );
                    }
                );
            } else if ( browserTab == 'newTab' ) {
                chrome.tabs.create({url:redirectUrl}, function(tab){
                if ( !tab ) {
                  chrome.windows.create({url:redirectUrl},function(win) {
                    chrome.windows.update(win.id, {focused: true}) 
                  })
                } else {
                  chrome.windows.update(tab.windowId, {focused: true})
                }
              })
            } else if ( browserTab == 'newWindow' ) {
                chrome.windows.create({ 
                    url: redirectUrl,
                    width: browserWidth,
                    height: browserHeight
                });
            }
        });
    }

    handleBrowserTabChange(e) {
        e.preventDefault();

        let showUserAgent = true;
        if ( e.target.value == 'newTab' ) {
            showUserAgent = false;
        }

        this.setState({
            browserTab: e.target.value,
            showUserAgent: showUserAgent
        });
    }

    handleUserAgentChange(e) {
        e.preventDefault();

        var userAgent = e.target.value,
            width = '',
            height = '';

        this.props.userAgents.forEach(function(userAgentRow) {
            if ( userAgentRow.key == userAgent ) {
                width = userAgentRow.width;
                height = userAgentRow.height;
            }
        });

        this.setState({
            userAgent: e.target.value,
            browserWidth: width,
            browserHeight: height
        });
    }

    changeBrowserUserAgent() {
        var userAgent = this.state.userAgent;
        var requestFilter = {
            urls: [ "<all_urls>" ]
            },
            extraInfoSpec = ['requestHeaders', 'blocking'],
            handler = function( details ) {
                var headers = details.requestHeaders,
                    blockingResponse = {},
                    headersSize = headers.length;
                for ( var i = 0; i < headersSize; ++i ) {
                    if ( headers[i].name == 'User-Agent' ) {
                        headers[i].value = userAgent;
                        break;
                    }
                }

                blockingResponse.requestHeaders = headers;
                return blockingResponse;
            };

        chrome.webRequest.onBeforeSendHeaders.addListener(handler, requestFilter, extraInfoSpec);
    }

    setCurrentDomain() {
        let currentDomain;
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            currentDomain = tabs[0].url.match(/^[\w-]+:\/{2,}\[?[\w\.:-]+\]?(?::[0-9]*)?/)[0];
            this.state.currentDomain = currentDomain;
        });
    }

    render() {
        return (
            <Container>
            {
                this.props.projects.length > 0 ? (
                    <Form onSubmit={this.handleSubmit}>
                        <FormGroup key="formGroupBrowserTab" row>
                            <Label key="browserTabLabel"
                                   for="browserTab"
                                    sm={2}>
                                Tab Action
                            </Label>
                            <Col sm={10}>
                                <Input type="select" 
                                       key="browserTab" 
                                       name="browserTab"
                                       id="browserTab"
                                       onChange={this.handleBrowserTabChange}>
                                {
                                    this.props.browserTabs.map(
                                        (tab) => 
                                        <option value={tab.key} key={"tab-" + tab.key}>{tab.name}</option>
                                    )
                                }
                                </Input>
                            </Col>
                        </FormGroup>
                        { this.state.showUserAgent == true &&
                        <FormGroup key="formGroupUserAgent" row>
                            <Label key="userAgentLabel"
                                   for="userAgent"
                                    sm={2}>
                                User Agent
                            </Label>
                            <Col sm={10}>
                                <Input type="select" 
                                       key="userAgent" 
                                       name="userAgent"
                                       id="userAgent"
                                       onChange={this.handleUserAgentChange}>
                                    {
                                        this.props.userAgents.map(
                                            (userAgent) => 
                                            <option value={userAgent.key} key={"userAgent-" + userAgent.name}>{userAgent.name}</option>
                                        )
                                    }
                                </Input>
                            </Col>
                        </FormGroup>
                        }
                        {
                            this.props.projects.map(
                                (project, projectIndex) => 
                                    <FormGroup key={"formGroup-" + projectIndex} row>
                                        <Label key={"project-" + projectIndex} 
                                               for={"environment-" + projectIndex}
                                                sm={2}>
                                            {project.name}
                                        </Label>
                                        <Col sm={10}>
                                            <Input type="select" 
                                                   key={"environment-" + project} 
                                                   name={"environment-" + projectIndex}
                                                   id={"environment-" + projectIndex}
                                                   onChange={this.handleChange}>
                                                <option value='' key="option-0">Select</option>
                                                {
                                                    project.environments.map(
                                                        (environment, environmentIndex) => 
                                                        <option key={"option-" + environmentIndex} value={environment.domain}>{environment.name}</option>
                                                    )
                                                }
                                            </Input>
                                        </Col>
                                    </FormGroup>
                            )
                        }
                    </Form>
                    ) : (
                        this.props.nonExistsProjectsWarning
                    )
                }
            </Container>
        );
    }
}

App.defaultProps = {
    projects: localStorage.getItem('projects') ? JSON.parse(localStorage.getItem('projects')) : [],
    browserTabs: [  
        {'key': 'currentTab', 'name': 'Current Tab'},
        {'key': 'newTab', 'name': 'New Tab'},
        {'key': 'newWindow', 'name': 'New Window'}
    ],
    nonExistsProjectsWarning: "You have no available projects. Please add your projects and domain names from the options page of plugin.",
    userAgents: [
        {
            'name': 'Current', 
            'key': ''
        },
        {
            'name': 'Galaxy S5', 
            'key': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36',
            'width': 360,
            'height': 640
        },
        {
            'name': 'Nexus 5X', 
            'key': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Mobile Safari/537.36',
            'width': 412,
            'height': 732
        },
        {
            'name': 'iPhone 7',
            'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
            'width': 375,
            'height': 667
        },
        {
            'name': 'iPhone 7 Plus',
            'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
            'width': 414,
            'height': 736
        },
        {
            'name': 'iPhone 8',
            'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
            'width': 375,
            'height': 667
        },
        {
            'name': 'iPhone 8 Plus',
            'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
            'width': 414,
            'height': 736
        },
        {
            'name': 'iPhone X',
            'key': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
            'width': 375,
            'height': 812
        },
        {
            'name': 'iPad',
            'key': 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            'width': 768,
            'height': 1024
        },
        {
            'name': 'iPad Pro',
            'key': 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            'width': 1024,
            'height': 1366
        },
    ]
};

export default App;