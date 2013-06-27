package org.extendedmind.search

import org.extendedmind.Settings

class ElasticSearchIndex(implicit val settings: Settings) extends SearchIndex{
  println("ElasticSearchIndex")
}