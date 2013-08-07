## Really Simple Color Picker 

This is a very minimal, yet robust Color Picker based on jQuery.

For more details check the introductory blog post - http://laktek.com/2008/10/27/really-simple-color-picker-in-jquery/

### Usage 

You can either clone [this repo](https://github.com/laktek/really-simple-color-picker) or download the latest build as a zip from here - http://github.com/laktek/really-simple-color-picker/zipball/master

Color Picker requires jQuery 1.2.6 or higher. Make sure to load it before Color Picker (there's no other dependencies!). 
For default styles of the color picker load the CSS file that comes with the plugin.

  ```html
    <script language="javascript" type="text/javascript" src=jquery.min.js"></script>
    <script language="javascript" type="text/javascript" src="jquery.colorPicker.min.js"/></script>

    <link rel="stylesheet" href="colorPicker.css" type="text/css" />
  ```

Add a text field to take the color input.

  ```html
    <div><label for="color1">Color 1</label> <input id="color1" type="text" name="color1" value="#333399" /></div>
  ```

Then call 'colorPicker' method on the text field when document loads.

  ```html
    <script language="javascript">
      jQuery(document).ready(function($) {
        $('#color1').colorPicker();
      }
    </script>
  ```

### Options

There are several options you can set at the time of binding. 

**Selected color**

Color Picker will use the value of the input field, which the picker is attached to as the selected color. If not, it will use the color passed with `pickerDefault` property.

  ```javascript
    $('#color1').colorPicker({pickerDefault: "ffffff"});
  ```

**Color Palette**

Overrides the default color palette by passing an array of color values.

  ```javascript
    $('#color1').colorPicker({colors: ["333333", "111111"]});
  ```

**Transparency**

Enable transparency value as an option.

  ```javascript
    $('#color1').colorPicker({transparency: true});
  ```

**Color Change Callback**

Registers a callback that can be used to notify the calling code of a color change.

  ```javascript
    $('#color1').colorPicker( { onColorChange : function(id, newValue) { console.log("ID: " + id + " has been changed to " + newValue); } } );
  ```

If you want to set an option gloablly (to apply for all color pickers), use:

  ```javascript
    $.fn.colorPicker.defaults.colors = ['151337', '111111']
  ```

**Default text on picker field**

You can set some text to show on the picker field. For example, you could show a user's initials.

  ```html
    <input id="color4" type="text" name="color4" value="#FF0000" data-text="AG" />
  ```

  ```javascript
    $('#color4').colorPicker();
  ```

### Demo

Demo can be found at http://laktek.github.com/really-simple-color-picker/demo.html

### Real-world Examples

* [CurdBee](http://demo.curdbee.com/settings/branding)
* [Readability](https://www.readability.com/publishers/tools)

Let us know how you are using Really Simple Color Picker...

### Contributors

* Lakshan Perera - http://laktek.com
* Daniel Lacy  - http://daniellacy.com

### Issues & Suggestions

Please report any bugs or feature requests here:
https://github.com/laktek/really-simple-color-picker/issues

