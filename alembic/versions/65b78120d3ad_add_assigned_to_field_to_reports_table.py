"""Add assigned_to field to reports table

Revision ID: 65b78120d3ad
Revises: 641700c80868
Create Date: 2025-11-14 18:28:53.298862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65b78120d3ad'
down_revision: Union[str, None] = '641700c80868'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.add_column(sa.Column('assigned_to', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_reports_assigned_to_users', 'users', ['assigned_to'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_constraint('fk_reports_assigned_to_users', type_='foreignkey')
        batch_op.drop_column('assigned_to')
