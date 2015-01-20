odata = require '../../index'

odata.set('db', 'mongodb://localhost/odata-test')

odata.resources.register
    url: '/resource-use-custom-id'
    model:
        id: Number

odata.listen 30001
