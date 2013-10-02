package org.extendedmind.db

trait GraphDatabase extends AbstractGraphDatabase 
with SecurityDatabase 
with UserDatabase 
with CollectiveDatabase
with ItemDatabase
with TaskDatabase
with NoteDatabase
with TagDatabase