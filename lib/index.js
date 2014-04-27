/**
  * Module dependencies.
  */
require('ember');

// template

var template = Em.Handlebars.compile([

  '<div class="pillbox">',
  '{{#each view.value}}',
  '<span>',
  '{{____label}}',
  '<a href="javascript:" {{action "removeTag" this target="view"}}>',
  '✕',
  '</a>',
  '</span>',
  '{{/each}}',
  '{{input value=view.userInput class="tags" placeholder=view.placeholder}}',
  '</div>',

  '<div>',
  '<ul>',
  '{{#each view.suggestions}}',
  '<li {{action "addTag" this target=view}}>',
  '{{partial "suggestion-item"}}',
  '</li>',
  '{{/each}}',
  '</ul>',
  '</div>'

].join(''));

// default suggestion template

Em.TEMPLATES['suggestion-item'] = Em.Handlebars.compile('{{this}}');

// mixin to be applied to an Em.View

module.exports = Em.Mixin.create({

  // public

  suggestionsLimit: 5,
  tagProperty: null,
  priorityProperty: null,
  placeholder: null,

  // private

  classNames: ['component-ember-suggest'],
  template: template,

  didInsertElement: function(){

    var self = this;
    this._super();
    this.$('input').on('keydown', function(e){
      if (8 === e.which && '' === e.currentTarget.value){
        e.preventDefault();
        var tags = self.get('value');
        self._removeTag(tags[tags.length-1]);
      }
    });

  },

  items: function(){
    var tagProperty = this.get('tagProperty');
    var content = this.get('content');
    if (!tagProperty) return content;
    content.forEach(function(item){
      item.set('____label', item.get(tagProperty));
    });
    return content;
  }.property('content'),

  suggestions: function(){
    var ret = [];
    var count = 0;
    var tags = this.get('value');
    var tagProperty = this.get('tagProperty');
    var suggestions = this.get('items');
    var limit = this.get('suggestionsLimit');
    var input = this.get('userInput');
    var priorityProperty = this.get('priorityProperty');

    // filter
    suggestions = suggestions.filter(function(item){
      return !tags.contains(item);
    });

    // sort
    if (priorityProperty) suggestions = suggestions.sortBy(priorityProperty);

    // search
    if (input) suggestions = suggestions.filter(function(suggestion){
      var tag = (tagProperty)
        ? suggestion.get(tagProperty)
        : suggestion;
      var re = RegExp(input, 'i');
      return re.test(tag);
    });

    // limit
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
  }.property('value.length', 'items.length', 'userInput'),

  actions: {
    addTag: function(item){
      this._addTag(item);
      this.set('userInput', '');
    },
    removeTag: function(item){
      this._removeTag(item);
      this.set('userInput', '');
    }
  },

  _removeTag: function(item){
    var val = this.get('value');
    val.removeObject(item);
  },

  _addTag: function(item){
    var val = this.get('value');
    if (val.contains(item)) return;
    val.addObject(item);
  }

});
