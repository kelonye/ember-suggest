/**
  * Module dependencies.
  */
require('ember');
var Pillbox = require('pillbox');

// template

var template = Em.Handlebars.compile([
  '<input >',
  '<ul>',
  '{{#each view.suggestions}}',
  '<li>',
  '{{partial "suggestion-item"}}',
  '</li>',
  '{{/each}}',
  '</ul>'
].join(''));

// default suggestion template

Em.TEMPLATES['suggestion-item'] = Em.Handlebars.compile('{{this}}');

// mixin to be applied to an Em.View

module.exports = Em.Mixin.create({

  // public

  suggestionsLimit: 5,
  tagProperty: null,
  priorityProperty: null,

  // private

  classNames: ['component-suggestion'],
  template: template,
  init: function(){

    this._super();

    var tags = this.get('value');
    if (!(tags instanceof Array)){
      this.set('value', []);
      tags = this.get('value');
    }

  },
  didInsertElement: function(){
    
    var self = this;

    this._super();

    var tags = this.get('value');
    var input = Pillbox(Em.$('input')[0]);

    input.on('add', function(tag){
      tags.pushObject(tag);
    });
    input.on('remove', function(tag){
      tags.removeObject(tag);
    });

  },
  suggestions: function(){
    var ret = [];
    var count = 0;
    var tags = this.get('value');
    var tagProperty = this.get('tagProperty');
    var suggestions = this.get('content');
    var limit = this.get('suggestionsLimit');
    var priorityProperty = this.get('priorityProperty');
    if (priorityProperty) suggestions = suggestions.sortBy(priorityProperty);
    for (var i=0; i<suggestions.length; i++){
      var suggestion = suggestions[i];
      var tag = (tagProperty)
        ? suggestion.get(tagProperty)
        : suggestion;
      if (!tags.contains(tag)){
        ++count;
        ret.pushObject(suggestion);
        if (count >= limit) break;
      }
    };
    return ret;
  }.property('value.length', 'content.length')

});
