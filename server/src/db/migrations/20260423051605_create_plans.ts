import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('plans', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable().unique();
        table.integer('duration_days').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('plans');
}

