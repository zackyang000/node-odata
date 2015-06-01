#!/usr/bin/env python

"""A quick helper command for converting raw HTML tables in your
markdown/restdown document to Google Code Wiki style tables. The expectation
that you'll use this as part of converting to using the markdown2
"wiki-tables" extra by putting this in your restdown documents metadata
block:

    markdown2extras: wiki-tables

Usage:

    python htmltables2wikitables.py [DOCUMENT_PATH...]
"""

import sys
import codecs
import re

VERBOSE = False


table_regex = re.compile(r"""
^<table>
(.*?)
</table>
""", re.S | re.M | re.X)
tr_regex = re.compile(r"""
^\s*<tr>
(.*?)
\s*</tr>
""", re.S | re.M | re.X)
td_regex = re.compile(r"""<td>([^<]*?)</td>""")


def htmltables2wikitables(path):
    print "# htmltables2wikitables %s" % path
    
    f = codecs.open(path, 'r', 'utf-8')
    before = f.read()
    f.close()
    
    idx = 0
    after = []
    for table in table_regex.finditer(before):
        if VERBOSE:
            print "--"
        rows = []
        for tr in tr_regex.finditer(table.group(0)):
            row = []
            for td in td_regex.finditer(tr.group(1)):
                # Normalize whitespace to a single line.
                cell = re.sub(r'\s*\n\s*', u' ', td.group(1)).strip()
                row.append(cell)
            rows.append(u"|| %s ||" % u" || ".join(row))
            if VERBOSE:
                print rows[-1]
        start, end = table.span()
        after.append(before[idx:start])
        after.append(u'\n'.join(rows))
        idx = end
    after.append(before[idx:])
    after = u''.join(after)
    
    if after == before:
        print "# '%s' not changed." % path
    else:
        print "# '%s' updated." % path
        f = codecs.open(path, 'w', 'utf-8')
        f.write(after)
        f.close()


# cloudapi multi-line: /indicating whether the value of

#---- mainline

if __name__ == '__main__':
    for path in sys.argv[1:]:
        if path in ("-h", "--help"):
            print __doc__
            break
        htmltables2wikitables(path)

