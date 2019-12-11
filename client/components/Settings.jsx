import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, 
		 FormText, ListGroup, ListGroupItem, 
		 Badge, FormFeedback, Container, Row, Col,
		 Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import  icon from '../icon.png';

class Settings extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	projects: localStorage.getItem('projects') ? JSON.parse(localStorage.getItem('projects')) : [],
	    	projectName: '',
	    	editProjectIndex: -1,
	    	showProjectIndex: -1,
	    	environmentName: '',
	    	environmentDomain: '',
	    	editEnvironmentIndex: -1,
	    	isValidDomain: null,
	    	isEnvironmentNameAtLeast: null,
	    	isProjectNameAtLeast: null,
	    	jsonModal: false,
	    	exportJsonAlertModal: false,
	    	json: '',
	    	isJsonValid: true
	    }

	    this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
	    this.handleEnvironmentNameChange = this.handleEnvironmentNameChange.bind(this);
	    this.handleEnvironmentDomainChange = this.handleEnvironmentDomainChange.bind(this);
	    this.handleDeleteProject = this.handleDeleteProject.bind(this);
	    this.handleExportProject = this.handleExportProject.bind(this);
	    this.handleDeleteEnvironment = this.handleDeleteEnvironment.bind(this);
	    this.handleEditProject = this.handleEditProject.bind(this);
	    this.handleEditEnvironment = this.handleEditEnvironment.bind(this);
	    this.handleShowProject = this.handleShowProject.bind(this);
	    this.handleProjectSubmit = this.handleProjectSubmit.bind(this);
	    this.handleEnvironmentSubmit = this.handleEnvironmentSubmit.bind(this);
	    this.checkValidDomain = this.checkValidDomain.bind(this);
	    this.checkCharacterLimit = this.checkCharacterLimit.bind(this);
	    this.toggleJsonForm = this.toggleJsonForm.bind(this);
	    this.toggleExportJsonAlertModal = this.toggleExportJsonAlertModal.bind(this);
	    this.handleJsonChange = this.handleJsonChange.bind(this);
	    this.handleJsonSubmit = this.handleJsonSubmit.bind(this);
	    this.handleExportProjects = this.handleExportProjects.bind(this);
	}

	handleProjectNameChange(e) {
		this.setState({
			projectName: e.target.value,
			isProjectNameAtLeast: this.checkCharacterLimit(e.target.value, 3)
		});
	}

	handleEnvironmentNameChange(e) {
		this.setState({
			environmentName: e.target.value,
			isEnvironmentNameAtLeast: this.checkCharacterLimit(e.target.value, 3)
		});
	}

	handleEnvironmentDomainChange(e) {
		let isValid = this.checkValidDomain(e.target.value);
		this.setState({
			environmentDomain: e.target.value,
			isValidDomain: isValid
		});
	}

	handleProjectSubmit(e) {
		e.preventDefault();

		let isValid = this.checkCharacterLimit(this.state.projectName, 3);
		if (isValid == false) {
			this.setState({
				isProjectNameAtLeast: isValid
			});
			return;
		}

		if (this.state.editProjectIndex != -1) {
			var projects = this.state.projects;
			projects[this.state.editProjectIndex].name = this.state.projectName;
		} else {
			if (!localStorage.getItem('projects')) {
				var projects = [];
			} else {
				var projects = JSON.parse(localStorage.getItem('projects'));
			}

			var subProjectObj = {};
			subProjectObj.name = this.state.projectName;
			subProjectObj.environments = [];
			projects.push(subProjectObj);
		}
		localStorage.setItem('projects', JSON.stringify(projects));
		this.setState({
			projects: projects,
			projectName: '',
			editProjectIndex: -1
		});
	}

	handleEnvironmentSubmit(e) {
		e.preventDefault();

		let isValid = this.checkCharacterLimit(this.state.environmentName, 3);
		if (isValid == false) {
			this.setState({
				isEnvironmentNameAtLeast: isValid
			});
			return;
		}

		isValid = this.checkValidDomain(this.state.environmentDomain);
		if (isValid == false) {
			this.setState({
				isValidDomain: isValid
			});
			return;
		}

		var projects = this.state.projects;
		var selectedProject = projects[this.state.showProjectIndex];
		var envObj = {};

		if (this.state.editEnvironmentIndex != -1) {
			envObj = selectedProject.environments[this.state.editEnvironmentIndex];
		}

		envObj.name = this.state.environmentName;
		envObj.domain = this.state.environmentDomain;

		if (!selectedProject.environments) {
			selectedProject.environments = [];
		}

		if (this.state.editEnvironmentIndex != -1) {
			selectedProject.environments[this.state.editEnvironmentIndex] = envObj;
		} else {
			selectedProject.environments.push(envObj);
		}

		projects[this.state.showProjectIndex] = selectedProject;

		localStorage.setItem('projects', JSON.stringify(projects));

		this.setState({
			projects: projects,
			editEnvironmentIndex: -1,
			environmentName: '',
			environmentDomain: ''
		});
	}

	handleDeleteProject(index) {
		this.setState(function(prevState) {
			let projects = prevState.projects.concat();
			projects.splice(index, 1);
			localStorage.setItem('projects', JSON.stringify(projects));
			return {
				projects: projects
			}
		});
	}

	handleExportProject(index) {
		let selectedProject = this.state.projects[index];
		this.downloadObjectAsJson(selectedProject, selectedProject.name);
	}

	handleExportProjects() {
		if ( this.state.projects.length == 0 ) {
			this.setState({
		    	exportJsonAlertModal: !this.state.exportJsonAlertModal
		    });
		} else {
			this.downloadObjectAsJson(this.state.projects, 'projects');
		}
	}

	downloadObjectAsJson(exportObj, exportName) {
	    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
	    var downloadAnchorNode = document.createElement('a');
	    downloadAnchorNode.setAttribute('href', dataStr);
	    downloadAnchorNode.setAttribute('download', exportName + '.json');
	    downloadAnchorNode.click();
	    downloadAnchorNode.remove();
	}

	handleDeleteEnvironment(index) {
		this.setState(function(prevState) {
			let projectEnvironemnts = prevState.projects[this.state.showProjectIndex].environments.concat();
			projectEnvironemnts.splice(index, 1);
			prevState.projects[this.state.showProjectIndex].environments = projectEnvironemnts;
			localStorage.setItem('projects', JSON.stringify(prevState.projects));
			return {
				projects: prevState.projects
			}
		});
	}

	handleEditProject(index) {
		this.setState({
			projectName: this.state.projects[index].name,
			editProjectIndex: index
		});
		this.projectNameRef.focus();
	}

	handleEditEnvironment(index) {
		this.setState({
			environmentName: this.state.projects[this.state.showProjectIndex].environments[index].name,
			environmentDomain: this.state.projects[this.state.showProjectIndex].environments[index].domain,
			editEnvironmentIndex: index
		});
		this.environmentNameRef.focus();
	}

	handleShowProject(index) {
		this.setState({
			showProjectIndex: index,
			environmentName: '',
			environmentDomain: ''
		});
	}

	checkValidDomain(domain) {
		var urlRegex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|local||sony|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    	return urlRegex.test(domain);
	}

	checkCharacterLimit(text, limit) {
		return text.trim().length >= limit;
	}

	toggleJsonForm(e) {
		this.setState({
	    	jsonModal: !this.state.jsonModal,
	    	isJsonValid: true,
	    	json: ''
	    });
	}

	toggleExportJsonAlertModal(e) {
		this.setState({
	    	exportJsonAlertModal: !this.state.exportJsonAlertModal
	    });
	}

	handleJsonChange(e) {
		this.setState({
			json: e.target.value
		});
	}

	jsonValidation(jsonObject, isJsonValid) {
		if ( jsonObject.hasOwnProperty('name')
			&& jsonObject.hasOwnProperty('environments') ) {
			let envRow;
			for ( envRow of Object.values(jsonObject.environments ) ) {
				if ( !envRow.hasOwnProperty('name') || !envRow.hasOwnProperty('domain') ) {
					isJsonValid = false;
					break;
				} else {
					isJsonValid = true;
				}
			}
		} else {
			isJsonValid = false;
		}

		return isJsonValid;
	}

	handleJsonSubmit(e) {
		e.preventDefault();

		let isJsonValid = true,
			jsonObject = null;

		// if the json content is a json
		if ( /^[\],:{}\s]*$/.test(this.state.json.replace( /\\["\\\/bfnrtu]/g, '@' )
							.replace( /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
							.replace( /(?:^|:|,)(?:\s*\[)+/g, '' ) ) ) {

			jsonObject = JSON.parse(this.state.json);
			if ( jsonObject.length != undefined && jsonObject.length > 0 ) {
				let projectObject;
				for ( projectObject of Object.values( jsonObject ) ) {
					isJsonValid = this.jsonValidation(projectObject, isJsonValid);
					if ( isJsonValid == false ) {
						break;
					}
				}
			} else {
				isJsonValid = this.jsonValidation(jsonObject, isJsonValid);
			}
		}

		this.setState({
			isJsonValid: isJsonValid
		});

		if ( isJsonValid == true ) {
			this.setState({
				json: ''
			});

			let projectsLength = this.state.projects.length;

			if ( jsonObject.length != undefined && jsonObject.length > 0 ) {
				let projectObject;
				for ( projectObject of Object.values( jsonObject ) ) {
					this.state.projects[projectsLength] = projectObject;
					projectsLength++;
				}
			} else {
				this.state.projects[projectsLength] = jsonObject;
			}

			localStorage.setItem('projects', JSON.stringify(this.state.projects));
			this.toggleJsonForm(e);
		}
	}

	render() {
	  	return (
	  		<Container>
	  			<Row>
		  			<div className="py-5 text-center">
						<img className="d-block mx-auto mb-4" src={icon} alt="" />
				        <p className="lead">Switch It! extension lets you change the URL of your selected website between its environments easily. Just add your project below and enter its environments’ URLs. Make sure you have the extension button in a handy place. Click on the extension button and select your new window/option, window resolution/device, and your environment and switch it!</p>
				    </div>
				    <Col xs="6">
				    	<h6 className="mb-3">Add project</h6>
				    	<Form onSubmit={this.handleProjectSubmit}>
				    		<Row>
				    			<Col xs="10">
				    				<Input 
				    					type="text" 
				    					name="projectName" 
				    					id="projectName" 
				    					placeholder="Project name" 
				    					value={this.state.projectName} 
				    					onChange={this.handleProjectNameChange} 
				    					innerRef={(input) => (this.projectNameRef = input)}
				    					required
				    					valid={false} />
				    					{
					    					this.state.isProjectNameAtLeast == false &&
						    				<FormFeedback>Please write at least 3 characters.</FormFeedback>
					    				}
				    			</Col>
				    			<Col xs="2">
				    				<Button>GO!</Button>
				    			</Col>
				    		</Row>
				    	</Form>
				    	<Modal isOpen={this.state.jsonModal} toggle={this.toggleJsonForm} className={this.props.className}>
				    		<Form onSubmit={this.handleJsonSubmit}>
					        	<ModalHeader toggle={this.toggleJsonForm}>JSON Content</ModalHeader>
					          	<ModalBody>
					            	<FormGroup row>
          								<Col sm={20}>
            								<Input 
            									type="textarea" 
            									name="json" 
            									id="json" 
            									value={this.state.json}
            									onChange={this.handleJsonChange}
            									required 
            									valid={false} />
            									{
							    					this.state.isJsonValid == false &&
								    				<FormFeedback>Please type a valid json.</FormFeedback>
							    				}
          								</Col>
        							</FormGroup>
					          	</ModalBody>
					          	<ModalFooter>
					            	<Button color="primary">Submit</Button>{' '}
					            	<Button color="secondary" onClick={this.toggleJsonForm}>Cancel</Button>
					          	</ModalFooter>
					        </Form>
				        </Modal>
				        <Modal isOpen={this.state.exportJsonAlertModal} toggle={this.toggleExportJsonAlertModal} className={this.props.className}>
				        	<ModalBody>
				            	There is no project to be exported.
				          	</ModalBody>
				          	<ModalFooter>
				            	<Button color="secondary" onClick={this.toggleExportJsonAlertModal}>Cancel</Button>
				          	</ModalFooter>
				        </Modal>
				    	<br />
				    	{ this.state.projects.length > 0 &&
				    		<div>
						    	<h6 className="mb-3">Projects</h6>
						    	<Row>
						    		<Col>
								    	<ListGroup>
								    		{
												this.state.projects.map(
													(project, index) => 
														<ListGroupItem className="justify-content-between" key={index}>
															{project.name} 
															<Button color="link" key="add-{index}" index={index} onClick={()=>this.handleShowProject(index)}>show</Button>
															<Button color="link" key="edit-{index}" index={index} onClick={()=>this.handleEditProject(index)}>edit</Button>
															<Button color="link" key="delete-{index}" index={index} onClick={()=>this.handleDeleteProject(index)}>delete</Button>
															<Button color="link" key="export-{index}" index={index} onClick={()=>this.handleExportProject(index)}>export</Button>
														</ListGroupItem>
												)
											}
										</ListGroup>
									</Col>
								</Row>
								<br />
							</div>
						}
						<h6 className="mb-3">Operations</h6>
						<Row>
			    			<Col xs="2">
				    			<Button color="primary" onClick={this.toggleJsonForm}>IMPORT</Button>
				    		</Col>
				    		<Col xs="2">
				    			<Button color="danger" onClick={this.handleExportProjects}>EXPORT</Button>
				    		</Col>
			    		</Row>
				    </Col>
				    { (this.state.projects[this.state.showProjectIndex] && this.state.showProjectIndex > -1) &&
				    	<Col xs="6">
				    		<h6 className="mb-3">Add environment to {this.state.projects[this.state.showProjectIndex].name}</h6>
					    	<Form onSubmit={this.handleEnvironmentSubmit}>
					    		<Row>
					    			<Col xs="5">
					    				<Input 
					    					type="text" 
					    					name="environmentName" 
					    					id="environmentName" 
					    					placeholder="DEV, STAGE, PROD, etc." 
					    					value={this.state.environmentName} 
					    					onChange={this.handleEnvironmentNameChange} 
					    					innerRef={(input) => (this.environmentNameRef = input)}
					    					required 
					    					valid={false} />
					    					{
						    					this.state.isEnvironmentNameAtLeast == false &&
						    					<FormFeedback>Please write at least 3 characters.</FormFeedback>
						    				}
					    			</Col>
					    			<Col xs="5">
					    				<Input 
					    					type="text" 
					    					name="environmentDomain" 
					    					id="environmentDomain"
					    					placeholder="https://www.domain.com, etc." 
					    					value={this.state.environmentDomain} 
					    					onChange={this.handleEnvironmentDomainChange} 
					    					innerRef={(input) => (this.environmentDomainRef = input)}
					    					required 
					    					valid={false} />
					    				{
					    					this.state.isValidDomain == false &&
					    					<FormFeedback>Please write a valid URL.</FormFeedback>
					    				}
					    			</Col>
					    			<Col>
					    				<Button>GO!</Button>
					    			</Col>
					    		</Row>
					    	</Form>
					    	{
					    		this.state.projects[this.state.showProjectIndex].environments.length > 0 &&
					    		<div>
							    	<br />
							    	<h6 className="mb-3">Environments</h6>
							    	<Row>
							    		<Col>
									    	<ListGroup>
												{
													this.state.projects[this.state.showProjectIndex].environments && 
														this.state.projects[this.state.showProjectIndex].environments.map(
															(environment, index) => 
																<ListGroupItem className="justify-content-between" key={index}>
																	{environment.name} - <a href={environment.domain} target="_blank">{environment.domain}</a>
																	<Button color="link" key="edit-{index}" index={index} onClick={()=>this.handleEditEnvironment(index)}>edit</Button>
																	<Button color="link" key="delete-{index}" index={index} onClick={()=>this.handleDeleteEnvironment(index)}>delete</Button>
																</ListGroupItem>
														)
												}
											</ListGroup>
										</Col>
									</Row>
								</div>
							}
				    	</Col>
				    }
				 </Row>
	  		</Container>
	    );
	}
}

//

class TextInput extends React.Component {

	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.props.handleChange(e.target.value);
	}

	render() {
		return (
			<div>
				<div className="label">
					{this.props.label}
				</div>
				<input className="input" type="text"
					   value={this.props.value}
					   onChange={this.handleChange} />
			</div>
		);
	}
}

//

export default Settings;