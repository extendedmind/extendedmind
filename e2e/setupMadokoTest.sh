#!/bin/bash
USER_UUID="4dd701c9-eefb-480e-b294-ce70b3bcf632"
TOKEN="7hpZjr5vXvDZvOeOafZ5fYzD02q3FcKER7f6/ZIhSdg="
BIB_UUID="80d40a69-e655-43f2-a1eb-6e96d0c29529"
MADOKO_UUID="3ed7f2ba-38a0-4974-af7d-751544c54c00"

# Change existing notes to contain Madoko file and bibliography
curl -u token:$TOKEN -H "Content-Type: application/json" -X PUT -d '{"content": "Author      : Timo Tiuraniemi\nAffiliation : University of Helsinki\nEmail : timo.tiuraniemi@iki.fi\nTitle  Note  : Draft, &date; (version 0.1)\nBib         : timo/bibliography\nDoc class   : article\nBib Style   : apalike\nCite Style  : textual\nPackage : biblatex\n\n[TITLE]\n\n#Introduction\n\nReferencing Mary Example (-@example_example_2008, 2-3) and Matt Etc  (-@etc_and_2009, 4-5)\n\n[BIB]\n", "title": "Madoko Test"}' http://localhost:8008/api/$USER_UUID/note/$MADOKO_UUID
curl -u token:$TOKEN -H "Content-Type: application/json" -X PUT -d '{"content": "@book{example_example_2008,\n\ttitle = {Example book},\n\tisbn = {952-5372-21-9},\n\tpublisher = {International Publisher},\n\tauthor = {Example, Mary},\n\tyear = {2008}\n}\n@article{etc_and_2009,\n\ttitle = {And then some},\n\tvolume = {45},\n\tissn = {1234-5678},\n\tauthor = {Etc, Matt},\n\tyear = {2009},\n\tpages = {43--72}\n}", "title": "Bibliography"}' http://localhost:8008/api/$USER_UUID/note/$BIB_UUID

# Publish bibliography
curl -u token:$TOKEN -d '{"path": "bibliography", "format": "bibtex"}' -H "Content-Type: application/json" http://localhost:8008/api/$USER_UUID/note/$BIB_UUID/publish

# Publish Madoko test document
curl -u token:$TOKEN -d '{"path": "madoko-test", "format": "madoko"}' -H "Content-Type: application/json" http://localhost:8008/api/$USER_UUID/note/$MADOKO_UUID/publish


