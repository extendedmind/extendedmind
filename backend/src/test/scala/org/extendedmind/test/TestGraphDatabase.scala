package org.extendedmind.test

import org.extendedmind.Settings
import org.extendedmind.domain.GraphDatabase
import org.extendedmind.bl.SearchIndex

class TestGraphDatabase(settings: Settings) 
				extends GraphDatabase with ImpermanentGraphDatabaseServiceProvider {
}