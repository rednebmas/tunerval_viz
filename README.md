# Tunerval Viz

Visualization of Tunerval data for my Information Vizualization class (INFO 474) using [d3](https://d3js.org/).

## Dev Setup

Setting up this vizualization locally takes a couple minutes, so for your convience I put it on a [hosted server (click me!)](http://104.196.247.146/index.html).

If you won't be running the server locally, no need to complete the following steps.

Because of the size of the dataset and the complexity of the filtering, I choose to put the dataset into a SQLite database. Because of this, the visualization needs a backend to retireve the data.  The web server framework that I used is  called [Sanic](https://github.com/channelcat/sanic) and runs on python3.

Also, I'm out of space on git large-file-storage, so I've hosted the dataset for this vizualization on Amazon S3. Before performing the commands below, copy [data.db](https://s3-us-west-2.amazonaws.com/sam-bender-public/data.db) (roughly 80mb) into the folder 'python'.

After you've done that you can run the following commands in your terminal to install the required dependencies and run the server.

```bash
# install required dependencies
pip3 install sanic aoiklivereload
	
# open it up and start the server
open http://0.0.0.0:8888/index.html && python3 server.py
```

## Links

[Treemap in d3 reference](https://bl.ocks.org/mbostock/4063582)

[Nesting in d3](https://bost.ocks.org/mike/nest/)

## Libraries Used

[Sanic](https://github.com/channelcat/sanic)

[d3](https://d3js.org/) 

[Bootstrap](http://getbootstrap.com/)

[Bootstrap date-picker](https://github.com/uxsolutions/bootstrap-datepicker)

[jQuery](https://jquery.com/), [jQueryUI](https://jqueryui.com/)

[moment.js](https://momentjs.com/)