"""Add AI validation fields to reports

Revision ID: 845a44fffa65
Revises: 65b78120d3ad
Create Date: 2025-11-14 19:01:45.606242

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '845a44fffa65'
down_revision: Union[str, None] = '65b78120d3ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ai_validated', sa.Integer(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('ai_confidence', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('ai_suggested_category', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('ai_urgency_level', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('ai_keywords', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('ai_reasoning', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch mode for SQLite
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.drop_column('ai_reasoning')
        batch_op.drop_column('ai_keywords')
        batch_op.drop_column('ai_urgency_level')
        batch_op.drop_column('ai_suggested_category')
        batch_op.drop_column('ai_confidence')
        batch_op.drop_column('ai_validated')
