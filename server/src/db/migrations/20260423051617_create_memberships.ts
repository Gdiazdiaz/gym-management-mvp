import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('memberships', (table) => {
        table.increments('id').primary();
        table.integer('member_id').notNullable().references('id').inTable('members').onDelete('CASCADE');
        table.integer('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.string('status', 20).notNullable().defaultTo('active');
        table.timestamp('canceled_at')
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.raw(`
        ALTER TABLE memberships
        ADD CONSTRAINT membership_status_check
        CHECK (status IN ('active', 'canceled', 'expired'))
        `);

    await knex.raw(`
        ALTER TABLE memberships
        ADD CONSTRAINT membership_dates_check
        CHECK (end_date >= start_date)
        `);

    await knex.raw(`
        CREATE UNIQUE INDEX idx_one_active_membership_per_member
        ON memberships (member_id)
        WHERE status = 'active';
        `);

        await knex.raw(`
            CREATE INDEX idx_memberships_member_id ON memberships (member_id)
            `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('memberships');
}

