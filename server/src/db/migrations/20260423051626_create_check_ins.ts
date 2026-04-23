import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('check_ins', (table) => {
        table.increments('id').primary();
        table.integer('member_id').notNullable().references('id').inTable('members').onDelete('CASCADE');
        table.integer('membership_id').notNullable().references('id').inTable('memberships').onDelete('CASCADE');
        table.timestamp('check_in_time').notNullable().defaultTo(knex.fn.now());
    });

    await knex.raw(`
        CREATE INDEX idx_check_ins_member_time
        ON check_ins (member_id, check_in_time DESC);
        `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('check_ins');
}

