# Pretty REST API docs authored in Markdown

1. Write a Markdown file that describes your REST API -- with some light
   conventions (see "Conventions" below) to structure to your doc file. E.g.:

        $ cat api.restdown    # or api.md or index.markdown whatever
        ---
        title: My Awesome REST API
        ---

        # My Awesome REST API

        Some introduction...

        # Wuzzers

        ## GET /wuzzers

        ...

        ## POST /wuzzers

        ...

2. Run it through `restdown` and out pops (a) "api.html", fairly light semantic
   HTML5 for your API; and (b) "api.json", a JSON representation of your API.

        $ restdown -m STATICDIR api.restdown

   where "STATICDIR" is a path to your static content served dir.

You should now have pretty decent looking REST API docs. Read on for
details.


# Installation

    cd /opt             # or whereever you like install apps
    git clone https://github.com/trentm/restdown.git
    cd restdown
    # Optionally checkout a particular release tag. E.g.:
    #   LATEST_RELEASE_TAG=`git tag -l | grep '[0-9]\+\.[0-9]\+\.[0-9]\+' | tail -1`
    #   git checkout $LATEST_RELEASE_TAG
    export PATH=`pwd`/bin:$PATH

Now you should be able to run restdown:

    restdown --version
    restdown --help



# Conventions

Expected conventions to follow in your restdown document to get nice REST
API docs.

- The first `h1` is the API title, and its body is a preface to the API.
  This first section is exluded from the table of contents (TOC).

- Subsequent `h1`'s are API section titles. (If your whole API is one logical
  grouping then you might need that second `h1` anyway. Please [log an
  issue](https://github.com/trentm/restdown/issues) if that is the case
  for you so I can gauge popularity.)

- `h2`'s are API methods. The text of the h2 should be one of the following
  forms:

        1. "NAME (VERB PATH)" if you name your api methods other than just
           with the HTTP verb and path. E.g. "ListMachines (GET /:login/machines)".

        2. "VERB PATH", E.g. "DELETE /widgets/:uuid"

        3. "NAME", E.g. "flickr.photos.recentlyUpdated".

  Note that while the more structured names aren't required, they will help
  get good docs (including: HTML anchors, table of contents entries,
  JSON API summary content, etc.).

- `h3`'s are just normal subsection headers within endpoints, if needed for
  longer documentation for a particular endpoint.

- `h4`'s are typically for showing example request and response output for
  an endpoint. A `pre`-block inside an `h4` will get a CSS class.



# Brands

A "brand" is a directory with all of the styling (CSS, JS, images) for a
restdown-created .html file. The default brand is called "ohthejoy". It was
originally derived from the styling of <https://api.no.de>, though has
diverged quite a bit by now. I (or you?) should add more.

The idea is that you can start with the brand here and tweak it to create your
own style. You can use your own brand files (for your own HTML/CSS/image
tweaks). Start by copying one of the brands in the restdown/brands directory
and then use the "-b|--brand" option to restdown. However, if you are happy
with the existing brand, then just keep using that. :)



# Document Metadata

A restdown document should start with a metadata block like this:

    ---
    key: value
    ...
    ---

At the least, you should provide the "title". Supported metadata keys
depend on the brand (the metadata is interpolated into the 'header.html.in'
and 'footer.html.in' files), but typical keys are:

- **title**: The text for the HTML `<title>`.

- **mediaroot**: The base URL from which to load the brand media (images, css).
  If not provided, the default is "media" (i.e. a relative path).

- **apisections**: By default *all* h1 sections (except the leading preface section)
  are presumed to define API methods, i.e. all h2's in them are methods. If
  this isn't the case for you (perhaps you have some expository sections),
  then you can explicitly list the sections that include API methods. This
  is a comma-separated list of h1 section titles. E.g.:

        apisections: Accounts, Data Centers, Widgets

- **markdown2extras**: A list of "extras" to be used for processing the
  markdown in the document. Valid values are
  [the Extra supported by python-markdown2](https://github.com/trentm/python-markdown2/wiki/Extras)
  (the Markdown processor used by restdown). Note that the "toc",
  "header-ids" and "markdown-in-html" extras are always turned on. E.g.:

        markdown2extras: wiki-tables, cuddled-lists

- **logo-color** (brands: spartan): A CSS color string (e.g. '#ff5533',
  'blue') to be used for the `#logo` element.

- **logo-font-family** (brands: spartan): A CSS `font-family` list of font
  faces for the `#logo` element. This also supports a font from
  [Google Web Fonts](http://www.google.com/webfonts) with a "google:"
  prefix. E.g.:

        logo-font-family: google:Aldrich, Verdana, sans-serif

- **header-font-family** (brands: spartan): A CSS `font-family` list of font
  faces for the `h1` - `h6` elements. Supports "google:" prefix as above.

Metadata can also be provided on the command-line with the `-d|--define` option. For example:

    restdown --define mediaroot=/ index.restdown


# JSON API Summary

A by-product of building the HTML file from the input Restdown is a JSON
API summary, that looks something like this:

    {
      "endpoints": [
        "GET    /wuzzers",
        "POST   /wuzzers",
        "DELETE /wuzzers",
        ...
      ]
    }

This might or might not be useful to you. Really it isn't *that* useful
but can make for a nice endpoints summary for someone `curl`'ing your API.

If you swing with the [expressjs](http://expressjs.com) crowd, here is how
you can wire this into your project:

    // Show JSON API summary by default, but show the API docs if accepts
    // HTML (e.g. in a browser).
    app.get('/', function(req, res) {
      var accept = req.header("Accept");
      if (accept && (accept.search("application/xhtml+xml") != -1
                     || accept.search("text/html") != -1)) {
        res.sendfile(__dirname + "/docs/api.html");
      } else {
        res.header("Content-Type", "application/json");
        res.sendfile(__dirname + "/docs/api.json");
      }
    });
