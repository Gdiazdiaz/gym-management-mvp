import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('members', (table) => {
        table.increments('id').primary();
        table.string('first_name', 100).notNullable();
        table.string('last_name', 100).notNullable();
        table.string('email', 255).notNullable().unique();
        table.string('phone_number', 20);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    await knex.raw(`
        CREATE INDEX idx_members_email ON members (
        lower(first_name), lower(last_name), lower(email)
        )
        `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('members');
}

