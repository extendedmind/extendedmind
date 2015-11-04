'use strict';

const extname = require('path').extname
const calculate = require('etag')
const fs = require('fs-promise')

module.exports = async function sendfile(ctx, path) {
  var stats = await fs.stat(path)
  if (!stats) return null
  if (!stats.isFile()) return stats

  ctx.response.status = 200
  ctx.response.lastModified = stats.mtime
  ctx.response.length = stats.size
  ctx.response.type = extname(path)
  if (!ctx.response.etag) ctx.response.etag = calculate(stats, {
    weak: true
  })

  // fresh based solely on last-modified
  let fresh = ctx.request.fresh
  switch (ctx.request.method) {
    case 'HEAD':
      ctx.response.status = fresh ? 304 : 200
      break
    case 'GET':
      if (fresh) {
        ctx.response.status = 304
      } else {
        ctx.body = fs.createReadStream(path)
      }
      break
  }

  return stats
}

