'use strict';

var React = require('react/addons');
var utils = require('./form/utils');

/**
 * Creates a self validating form that 
 * manages it's values
 *
 * @class Form
 */
var Form = React.createClass({
    /**
     * Includes a list of w3 form attributes
     *
     * @param {Object} propTypes
     */
    propTypes: {
        'accept-charset': React.PropTypes.string,
        'action':         React.PropTypes.string,
        'autocomplete':   React.PropTypes.oneOf(['on', 'off']),
        'encrypt':        React.PropTypes.oneOf(utils.encryptTypes),
        'method':         React.PropTypes.string,
        'name':           React.PropTypes.string,
        'novalidate':     React.PropTypes.oneOf(['novalidate']),
        'target':         React.PropTypes.string,
        'onSubmit':       React.PropTypes.func
    },
    
    getDefaultProps: function() {
        return {
            // Required if user does not supply
            'onSubmit': function(){}
        };
    },
    
    getInitialState: function() {
        return {
            fields: {},
            valid: false,
            data: {}
        }; 
    },

    componentWillMount: function() {
        this._children = [];
        this.registerChildFields();
        this.setFormAttributes();
    },
    
    /**
     * Adds callback properties to a cloned 
     * version of the child using `cloneWithProps`.
     *
     * @method registerChildFields
     */
    registerChildFields: function() {
        React.Children.forEach(this.props.children, function(child, index) {
            if (this.validFormChild(child)) {
                this._children.push(this.attachCallbacks(child, index));
            } else if (typeof child.props.children === 'object') {
                this._children.push(this.cloneWithKey(this.registerNestedChildren(child), index));    
            } else {
                this._children.push(child);
            }
        }.bind(this));
    },
    
    /** 
     * Recursive method that clones each 
     * child attaching callbacks on `Form`
     * specific inputs
     *
     * @method registerNestedChildren
     */
    registerNestedChildren: function(element) {
        var children = [];

        React.Children.forEach(element.props.children, function(child, index) {
            if (this.validFormChild(child)) {
                children.push(this.attachCallbacks(child, index));
            } else if (typeof child.props.children === 'object') {
                children.push(this.cloneWithKey(this.registerNestedChildren(child), index));
            } else {
                children.push(child);
            }
        }.bind(this));

        return React.addons.cloneWithProps(element, {
            children: children
        });
    },

    /**
     * Helper method to check if an
     * input is a valid `Form` input
     *
     * @method validFormChild
     * @return boolean
     */
    validFormChild: function(child) {
        return child.type && child.type.displayName === 'Input'; 
    },
    
    /**
     * Helper method that returns a
     * cloned version of a child with
     * it's key attached
     *
     * @method cloneWithKey
     */
    cloneWithKey: function(klass, index) {
        return React.addons.cloneWithProps(klass, {
            key: index
        });
    },
    
    /**
     * Helper method that attaches 
     * callbacks and a key to a `Form`
     * input
     *
     * @method attachCallbacks
     */
    attachCallbacks: function(child, index) {
        return React.addons.cloneWithProps(child, {
            _updateFieldValue : this._updateFieldValue,
            _updateValidationState : this._updateValidationState,
            key: index
        });
    },
    
    /**
     * Sets `_fromAttributes` to an object of 
     * valid w3 form arttibutes.
     *
     * @method setFormAttributes
     */ 
    setFormAttributes: function() {
        this._formAttributes = {};

        for(var prop in this.props) {
            if (utils.formValidProps.indexOf(prop) !== -1) {
                this._formAttributes[prop] = this.props[prop];
            }     
        } 
    },
    
    /**
     * Callback placed on each child responsible for 
     * updating `Form`'s validation state.
     *
     * @method updateValidationState
     */
    _updateValidationState: function(valid, name) {
        var fields = this.state.fields;
        fields[name] = valid;
        this.setState({fields: fields});
        this.validateForm();
    },
    
    /**
     * Callback placed on each child responsible
     * for maintaining field values of `Form`. 
     *
     * @method updateFieldValue
     */
    _updateFieldValue: function(name, value) {
        var data = this.state.data;
        data[name] = value;
        this.setState({data: data});
    },

    /**
     * Updates `Form`'s validation state
     * by itterating through all the fields
     * and checking their state. 
     *
     * @method validateForm
     */
    validateForm: function() {
        var valid = true;
        var fields = this.state.fields;
    
        for(var field in fields) {
            if(fields[field] === false) {
                valid = false;
            }
        } 
        this.setState({valid: valid});
    },

    /**
     * Passes onSubmit function of form
     * to props `onSubmit` with the event 
     * and data from form. 
     *
     * @method onSubmit
     */ 
    onSubmit: function(e) {
        this.props.onSubmit(e, this.state.data);
    },

    render: function() {
        return ( 
            <form {...this._formAttributes} onSubmit={this.onSubmit}>
                {this._children}
            </form>
        );
    }
});

module.exports = {
    Form: Form,
    Input: require('./form/input'),
    Submit: require('./form/submit'),
    Validate: require('./form/validations')
};
