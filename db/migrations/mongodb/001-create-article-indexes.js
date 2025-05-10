// This script assumes you are using the MongoDB shell or a migration tool like migrate-mongo

module.exports = {
  async up(db) {
    await db.collection('articles').createIndex({ title: 'text', content: 'text' });
    await db.collection('articles').createIndex({ slug: 1 });
    await db.collection('articles').createIndex({ category: 1 });
    await db.collection('articles').createIndex({ status: 1 });
  },

  async down(db) {
    await db.collection('articles').dropIndex('title_text_content_text');
    await db.collection('articles').dropIndex('slug_1');
    await db.collection('articles').dropIndex('category_1');
    await db.collection('articles').dropIndex('status_1');
  }
}; 