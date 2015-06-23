# Making chart using Chartbuilder

## 1. Get your data into the correct format

Chartbuilder expects your data to be in a specific format, which looks something like this:

![image of data](https://farm8.staticflickr.com/7699/17183277839_87c049bf70_b.jpg)

For this tutorial we'll use [this data](https://docs.google.com/a/qz.com/spreadsheets/d/1xScjLJvFk1a0RjRWedi4ICmpeAMJ4t3s0HCZ3ROeSbg/edit#gid=0)

Every row after should represent one moment in the data and every column after should represent one series of data. The first column and the first row are used as your axis and series labels. 

The design of the charts that Chartbuilder creates works best if your numbers are less than 1,000. For instance instead of "2,345,000,000" reduce it to 2.345 (you'll add a "billions" label in step 4)

## 2. Paste it into Chartbuilder from your spreadsheet software

Open up Chartbuilder in your browser, it should look something like this

![Default Chartbuilder screen](https://farm8.staticflickr.com/7704/17181433080_845abddab6_b.jpg)

By copy and pasting your data from software like Microsoft Excel or Google Drive it should appear as tab-separated in Chartbuilder

If your data is in the proper format, you should see a green confirmation below the input area—otherwise there will be a message in red alerting you to why Chartbuilder is having a hard time with your data.

Using the data from above Chartbuilder should now look like this
![Chartbuilder with population data](https://farm9.staticflickr.com/8844/17369153611_5eac284260_b.jpg)

## 3. Select the way you want to display your data

For every series you have there is an option for how you want to have it displayed. You can select lines, columns, or dots.

![Series options](https://farm8.staticflickr.com/7662/17161573737_8426acd38b.jpg)

You can select which type of display you want by clicking the designated button. Lets leave it on the default: "Lines"

Clicking on the colored circle will reveal the available colors in your version of chartbuilder, clicking on one will change the color of the series associated with it.

![Color options](https://farm9.staticflickr.com/8735/17181250108_a10895c52d.jpg)

## 4. Set your units and adjust axis

Chartbuilder gives you the option to label your axes inline. Input text into the "prefix" field to add something like a currency unit to before the top most axis item.

Input text into the "suffix" field to add something like the magnitude (" millions") or unit (" per capita") of your data to after the top most axis item

For this data lets leave the prefix blank and set " billion people" as the suffix.

Lets also set the Axis minimum to 0, the maximum to 1.5 and the ticks to 7. 

Your Chartbuilder should now look like this
![Chartbuilder after modifying axis](https://farm9.staticflickr.com/8737/17367613192_fce8b2abd0_b.jpg)

## 5. Add a Title and the source of your data

Want to add a title to your chart? Add one by typing into the "add a Title" filed

How about "The three most populous countries"

You'll notice that as you type the chart updates

Also, add the source of your data into the "Add a source field"

In this case it's "University of Groningen, University of California, Davis, and University of Pennsylvania"

## 6. Select a size and export

What size do you want your chart to be? You can select "Medium" "Long and Skinny" or "spot"

Lets keep it as "Medium"

Click the "Download Image" button

If you're using Chrome or Firefox this image should download

![Chartbuilder chart](https://farm8.staticflickr.com/7781/17343423666_49106df3bd_b.jpg)

If you're using Safari it will show up in your browser. Right click and save to download it.

### Next tutorial: [Charting a column chart using ordinal data](column-chart-ordinal-data.md)