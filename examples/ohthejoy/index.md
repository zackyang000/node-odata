---
title: Dataset API (DSAPI)
mediaroot: media
markdown2extras: wiki-tables
---

# Dataset API

The Dataset API is a repository for dataset metadata and files for
SmartDataCenter. Datasets are the files and information used to create
machines (VMs and SmartMachines) in SmartDataCenter.
This is running DSAPI version {{version}}.

### All API calls start with

<pre class="base">
{{url_base}}
</pre>

### Format

All responses are **JSON** (that is, except for the current HTML docs that
you are reading).




# Datasets

## GET /datasets

Get the list of all dataset manifests. This list is limited to those the
authenticated user has access to (see the `restricted_to_uuid` field
below.) If no HTTP Basic auth credentials are provided, then the set is
limited to public datasets.

The list can be filtered on some of the manifest fields. Currently:
**name**, **version**, **type**, **os**, **restricted\_to\_uuid** and **creator\_uuid**.
For example: `/datasets?name=nodejs`.

Results are ordered by creation timestamp (`published_at` field), most recent
first.


#### example request

    $ curl {{url_base}}/datasets

#### response

    [
      {
        "uuid": "7a2a7841-a8c8-42c8-89e0-8043c7721327"
        "name": "nodejs",
        "version": "1.0.0"
        ...
        "published_at": "2011-03-17T23:56:37Z",
      },
      {
        "uuid": "22639f9e-2bad-4cf0-b6bf-43380e318cc2"
        "name": "smartos",
        "version": "1.3.8",
        ...
        "published_at": "2011-03-15T13:33Z",
      },
      ...
    ]



## GET /datasets/:id

Get a specific dataset manifest by UUID or by URN. HTTP Basic auth
credentials must be passed to access non-public datasets. 


#### example request

    $ curl {{url_base}}/datasets/cc707720-359e-4d84-89a7-e50959ecba43

#### response

    {
      "cloud_name": "sdc",
      "name": "nodejs",
      "version": "1.0.0",
      "type": "zone-dataset",
      "description": "node.js git-deploy PaaS template",
      "published_at": "2011-03-17T23:56:37Z",
      "os": "smartos",
      "files": [
        {
          "path": "nodejs-1.0.0.zfs.bz2",
          "sha1": "9a9dc5f7841a5620094de622878601f65e9c3483",
          "size": 262749905
        }
      ],
      "requirements": {
        "networks": [{"name": "net0", "description": "public"}]
      },
      "uuid": "cc707720-359e-4d84-89a7-e50959ecba43",
      "creator_uuid": "352971aa-31ba-496c-9ade-a379feaecd52",
      "creator_name": "sdc",
      "urn": "sdc:sdc:nodejs:1.0.0"
    }

Responds with **403 Forbidden** if access to the dataset is restricted
(see `restricted_to_uuid` discussion below).

#### example 403 response

    {
      "error": {
        "message": "Dataset '462e47e8-26fd-de45-b820-12e12c142d99' is restricted.",
        "code": 403
      }
    }



## GET /datasets/:id/:path

Download a dataset file. `:id` is a Dataset UUID or URN. Provide HTTP Basic
auth credentials to access restricted dataset files (see `restricted_to_uuid`
below).

#### example request

    $ curl {{url_base}}/datasets/22639f9e-2bad-4cf0-b6bf-43380e318cc2/nodejs-1.0.0.zfs.bz2 \
        -o nodejs-1.0.0.zfs.bz2

Responds with **403 Forbidden** if access to the dataset is restricted.
Responds with **404 Not Found** if the dataset doesn't have the named file.

#### example 403 response

    {
      "error": {
        "message": "Dataset '462e47e8-26fd-de45-b820-12e12c142d99' is restricted.",
        "code": 403
      }
    }

#### example 404 response

    {
      "error": {
        "message": "Dataset '1dd09279-3edb-944d-bdd4-31a06111004e' does not have a 'bogus-1.0.0.zfs.bz2' file.",
        "code": 404
      }
    }


## GET /assets/:path

**DEPRECATED** Download a dataset file. This is deprecated (only remains
for backward compatibility). Will be removed in 2011Q3.

Use [GET /dataset/:id/:path](#GET-/datasets/:id/:path) instead.

|| **Response Code** || **Description** ||
|| **403_Forbidden** || if access to the dataset is restricted. ||
|| **404_Not_Found** || if the path isn't a part of any datasets. ||
|| **400_Bad_Request** || if the path is ambiguous (two datasets with the same path). Let's add some really long text here because want to see alignment in table for a cell that spans two lines. ||



#### example request

    $ curl {{url_base}}/assets/nodejs-1.0.0.zfs.bz2 -o nodejs-1.0.0.zfs.bz2




## PUT /datasets/:uuid

Add (or replace) a new dataset to the repository.  This must be a
'multipart/form-data' encoded request with one or more files: The first
file must be called "manifest" and is the Dataset manifest. Then additional
file(s) sections for each of the paths in the manifest "files" section.

Only users with the "add-datasets" permission and administrators may add
datasets.

#### example request

    $ curl {{url_base}}/datasets/cc707720-359e-4d84-89a7-e50959ecba43 \
        -X PUT \
        -u joe:password \
        -F manifest=@nodejs-1.0.0.dsmanifest \
        -F nodejs-1.0.0.zfs.bz2=@nodejs-1.0.0.zfs.bz2 

#### response

    {
      "name": "nodejs",
      "version": "1.0.0",
      "type": "zone-dataset",
      "description": "node.js git-deploy PaaS template",
      "published_at": "2011-03-17T23:56:37.600Z",
      "os": "smartos",
      "files": [
        {
          "path": "nodejs-1.0.0.zfs.bz2",
          "sha1": "9a9dc5f7841a5620094de622878601f65e9c3483",
          "size": 262749905,
          "url": "/datasets/cc707720-359e-4d84-89a7-e50959ecba43/nodejs-1.0.0.zfs.bz2"
        }
      ],
      "requirements": {
        "networks": [{"name": "net0", "description": "public"}]
      },
      "uuid": "cc707720-359e-4d84-89a7-e50959ecba43",
      "creator_uuid": "352971aa-31ba-496c-9ade-a379feaecd52"
    }

On error it can respond with any of **409 Conflict** (if UUID is taken),
**403 Forbidden** (if not authorized to add datasets) or
**400 Bad Request** (validation errors).

#### example error response

    {
      "error": {
        "message": "UUID param, '73ce06d8-7ae7-11e0-b0df-1fcf8f45c5d5', does not match the UUID in the uploaded manifest, '63ce06d8-7ae7-11e0-b0df-1fcf8f45c5d5'.",
        "code": 400
      }
    }



## DELETE /datasets/:uuid

Delete the identified dataset. You must be the creator of the dataset
(`creator_uuid` field) or an administrator.

#### example request

    $ curl {{url_base}}/datasets/cc707720-359e-4d84-89a7-e50959ecba43 \
        -X DELETE -u joe:password -i

#### response

    HTTP/1.1 204 No Content
    Content-Length: 0
    Connection: keep-alive

#### example error response

    {
      "error": {
        "message": "Cannot delete dataset '9a2a7841-a8c8-42c8-89e0-8043c7721327': must be the dataset creator.",
        "code": 403
      }
    }



# General

## GET /

Return this HTML documentation or a JSON representation of the API, depending
on the request "Accept" header.

#### example JSON response

    {
      "endpoints": [
        "GET    /datasets", 
        "GET    /datasets/:id", 
        "GET    /datasets/:id/:path", 
        "GET    /assets/:path", 
        "PUT    /datasets/:uuid", 
        "DELETE /datasets/:uuid", 
        "GET    /", 
        "GET    /ping"
      ],
      "version": "2.2.0",
      "cloud_name": "sdc"
    }



## GET /ping

General health check: "Is the server up?"
If basic auth credentials are provided, then authorization will be attempted
and, on success, some authorized user data shown in the response.

#### example JSON response

    {
        "ping": "pong",
        "auth": {
            "login": "joe",
            "uuid": "4d9deb82-c574-fe43-9b69-3de0ee8ac87a"
        }
    }



# Manifest Specification

A dataset manifest is a set of static metadata for the dataset. It is
typically in the form of a JSON ".dsmanifest" file (as produced by the Joyent
`tpl` tool for building datasets) or a JSON response from this Dataset API.

Example manifest (Backward compatible fields have been excluded. Not all
possible fields are shown in this example. See discussion below):

    {
      "uuid": "63ce06d8-7ae7-11e0-b0df-1fcf8f45c5d5",
      "cloud_name": "sdc",
      "creator_uuid": "930896af-bf8c-48d4-885c-6573a94b1853",
      "creator_name": "sdc",
      "name": "smartos",
      "version": "1.3.13",
      "urn": "sdc:sdc:smartos:1.3.13",
      "type": "zone-dataset",
      "description": "Base template to build other templates on",
      "published_at": "2011-05-10T09:25Z",
      "os": "smartos",
      "files": [
        {
          "path": "smartos-1.3.13.zfs.bz2",
          "sha1": "a287dc535e2fb9a5a8e26b211156016b4e6cf267",
          "size": 41982720
        }
      ],
      "requirements": {
        "networks": [
          {
            "name": "net0",
            "description": "public"
          }
        ]
      }
    }

Each of these manifest fields, plus some optional fields that are not
used in the above example, are specified here. Fields marked "*required*"
are required when [adding a dataset](#PUT-/datasets/:uuid). Fields marked
"*optional*" are just that -- often only relevant for certain dataset types.
Fields marked "*server*" are added by the Dataset API server, i.e. need
not be specified when adding a dataset but will always be present when
retrieving the manifest from the Dataset API.

**`uuid`** (*required*) is the unique identifier for this dataset.

**`cloud_name`** (*server*) identifies from which dataset repository (a.k.a.
which Dataset API instance) this dataset originated. "sdc" is the cloud_name
for <https://datasets.joyent.com> -- the special-case global Dataset API that
isn't directly associated with a cloud provider. A cloud provider may also
have a Dataset API local to that cloud's suite of data centers. The cloud
name for a Dataset API is available at the [root endpoint](#GET-/).

Note: When doing local development of a dataset (e.g. with the `tpl` and
`sdc-dsimport` tools), a dataset is imported into the Master API (MAPI)
without going through a Dataset API. Lacking a DSAPI cloud\_name, the
special case "local" cloud\_name is attached.

**`creator_uuid`** (*server*) identifies the creator of the dataset. It is
the UUID of the authenticated user that added the dataset. It is the UUID for
a customer in the local cloud's Customers API (CAPI). For backward
compatibility, the `vendor_uuid` id field is a supported alias for this
field (will be removed in 2011Q3).

**`creator_name`** (*server*) is the "login" name for the creator_uuid.

**`name`** (*required*) is a short name for the dataset. It may only contain
ascii letters, numbers, hypens ('-'), periods ('.') and underscores ('\_')
and it must start with a letter. While capital letters are allowed, they are
discouraged. The name is case-sensitive and is limited to 32 characters.

**`version`** (*required*) is a short version string for the dataset. It may
only contain ascii letters, numbers, hypens ('-'), periods ('.') and
underscores ('\_'). While not enforced, it is strongly encouraged that
dataset authors use the "X.Y.Z" semantic versioning scheme described at
<http://semver.org/>. The version is limited to 32 characters.

**`urn`** (*server*) is a nicer (that the uuid) string that uniquely
identifies a dataset. It is constructed from the cloud\_name, creator\_name,
name and version fields. See below for more "URN" discussion.

**`description`** (*required*) is a short prose description of the dataset.
It is limited to 255 characters.

**`published_at`** (*server*) is a date and time (in ISO format) at which the
dataset was published to the DSAPI. Note: For backward compatibility the
`created_at` and `updated_at` fields (now deprecated) are aliases for this
field. These aliases will be removed sometime in 2011Q4.

**`type`** (*required*) is the dataset type. Valid types are:
"**zone-dataset**" for a ZFS dataset used to create a new SmartOS zone, or
"**vmimage**" for a virtual machine image.

**`os`** (*required*) is the operating system of the dataset file. Valid
values include: "**smartos**", "**windows**", and "**linux**". These
spellings are not currently enforced but may be in future versions of the
DSAPI. It is expected that more OS values will be added.

**`files`** (*required*) is an array of data files that make up the dataset.
Often there is just one, but more are allowed. Each file is an object with
three fields: **`path`** (the filename of this file), **`sha1`** the SHA-1
checksum of the file, **`size`** the size in bytes of the file. The path
field must be a relative path. While it does allow hierarchy (i.e.
'/'-separate components) that is typically unnecessary and is discouraged.
For backward compatibility the DSAPI server adds a download **`url`** field
to be used for downloading the file content (will be removed in 2011Q3). New
users should just use the
[GET /datasets/:uuid/:path](#GET-/datasets/:uuid/:path) endpoint for
downloading dataset files.

**`restricted_to_uuid`** (*optional*) is a UUID (entry in the cloud Customer
API) to which to restrict access to this dataset. I.e. A package author
may set this to the same as creator\_uuid to make this dataset private to
them. A dataset without restricted\_to\_uuid set is public. The
"read-all-datasets" permission can be given to a user to enable read-only
access to restricted datasets. Note: For backward compatibility, the
`owner_uuid` field is a supported alias for this field (will be removed in
2011Q3).

**`requirements`** is a grouping of various requirements
for provisioning a machine with this dataset. Currently specified
requirements fields are:

- **`networks`** (*optional*) is array describing the minimum number of network
  interfaces. This example shows a dataset that requires one VNIC:
  `"networks": [{"name": "net0", "description": "public"}]`.

- **`password`** (*optional*) is a boolean indicating that provisioning with this dataset
  requires that a password be provided. For example, provisioning a Windows
  VM requires an initial password for the Administrator account. If not
  defined, it is presumed to be *false*.

- **`ssh_key`** (*optional*) is a boolean indicating that provisioning with this dataset
  requires that an SSH public key be provided. For example, provisioning a
  Linux VM requires an SSH key for initial SSH access. If not
  defined, it is presumed to be *false*.

**`users`** (*optional*) is a list of users for which passwords should be
generated for provisioning. This may only make sense for some datasets.
Example: `"users": [{"name": "root"}, {"name": "admin"}]`

**`generate_passwords`** (*optional*) is a boolean indicating whether to
generate passwords for the users in the "users" field. If not present, the
default value is *true*.

**`inherited_directories`** (*optional*) is a list of inherited directories
(other than the defaults for the brand). This can be left out or the empty
list if the dataset need not inherit directories. This field only makes sense
for datasets of type "zone-dataset".
Example: `"inherited_directories": ["/opt/support"]`.

**`platform_type`** (*optional*) identifies the host platform type on which
this dataset can run. Valid values are "smartos" and "hvm". This will default
to "hvm" for "type==vmimage" and to "smartos" otherwise.

**`nic_driver`** (*required if type==vmimage*) The NIC driver used by this
VM image. Examples are 'virtio', 'ne2k_pci', 'rtl8139', 'e1000', 'pcnet'.

**`disk_driver`** (*required if type==vmimage*) The disk driver used by this
VM image. Examples are 'virtio', 'ide', 'scsi'.

**`cpu_type`** (*optional*, defaults to "qemu64" for datasets of type
"vmimage") The QEMU CPU model to use for this VM. Examples are: "qemu64",
"host".

**`image_size`** (*required if type==vmimage*) is the size (in MiB) of
the VM's disk, and hence the required size of allocated disk for
provisioning.




# Dataset URNs

Every dataset has a UUID, but using UUIDs for provisioning and identifying
and communicating can be painful, so the following URN scheme can also be
used to uniquely identify datasets. Note that technically speaking,
the "urn" string used in the Dataset API is really the Namespace Specific
String (NSS) part of a proper URN (as per
<http://en.wikipedia.org/wiki/Uniform_Resource_Name>). A full URN is achieved
by prefixing "urn:sdcdataset:".

A full dataset URN is (using the manifest field names described above):

    cloud_name:creator_name:name:version

Examples Dataset URNs ("Acme" and "JPC" examples are hypothetical):

    sdc:sdc:smartos:1.3.13
    sdc:sdc:nodejs:1.1.4
    sdc:basho:riak:1.3.1        # Basho-built dataset in datasets.joyent.com
    
    acme:acme:mysql:1.0.0       # Acme-built custom MySQL dataset in the Acme cloud
    
    acme:joe:webhead:1.0.0      # Acme customer "joe"'s webhead dataset
    acme:joe:database:1.0.0
    acme:sally:webhead:1.0.0
    acme:sally:mysql:1.0.0

    # Joyent Public Cloud (jpc) customer "sally"'s webhead and mysql datasets
    # in the JPC cloud. The point here is that this "sally" is unrelated to
    # the "sally" in the Acme cloud.
    jpc:sally:webhead:1.0.0
    jpc:sally:mysql:1.0.0


A few *shortcuts* are supported for URNs. Mostly these are relevant for
usage with the SDC Cloud API for provisioning machines.

The "cloud\_name:creator\_name" can be elided, meaning "sdc:sdc":

    smartos:1.3.13      # shortcut for "sdc:sdc:smartos:1.3.13"
    nodejs:1.1.4        # shortcut for "sdc:sdc:nodejs:1.1.4"

The "version" field can be elided meaning the "latest released" dataset in
that group. The latest dataset within a group is the most recent sorted by
the "created\_at" manifest field. (The "version" field is NOT currently
used for sorting. Doing so would require tight specification of version
strings.) The Master API might have a flag indicating whether a recent
dataset is yet "released". For example it might still be in testing.

    smartos             # latest released sdc:sdc:smartos:*
    sdc:basho:riak      # latest released sdc:basho:riak:*
    acme:sally:webhead



