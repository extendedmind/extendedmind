package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.db.GraphDatabase
import org.extendedmind.search.SearchIndex

class TestGraphDatabase(settings: Settings) 
				extends GraphDatabase with ImpermanentGraphDatabaseServiceProvider {
}